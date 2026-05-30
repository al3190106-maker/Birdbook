/**
 * NavigationManager for Naturboken PWA
 * 
 * Centralized navigation system that manages browser history for:
 * - Tabs (log-view, guide-view, stats-view, etc.)
 * - Sub-views (guide categories, photographer detail)
 * - Modals (detail, sighting, fullscreen, settings, etc.)
 *
 * All navigation goes through this manager to ensure the mobile back button
 * always does the right thing.
 *
 * Usage:
 *   nav.register('detail-modal', { type: 'modal', open: fn, close: fn });
 *   nav.switchTab('guide-view');
 *   nav.openSubview('guide-category', { category: 'Andfåglar' });
 *   nav.openModal('detail-modal', { birdId: 'mallard' });
 *   nav.back(); // close top layer
 */

window.nav = (function () {
    // --- Internal state ---
    const _handlers = {};       // id -> { type, open(data), close(data) }
    let _currentTab = 'log-view';
    let _subview = null;        // { id, data } or null
    let _modalStack = [];       // [{ id, data }, ...]
    let _initialized = false;
    let _pausePopstate = false; // Used during batch operations

    // --- Registration ---

    /**
     * Register a navigation target.
     * @param {string} id   - Unique identifier (e.g. 'log-view', 'detail-modal')
     * @param {object} config
     * @param {'tab'|'subview'|'modal'} config.type
     * @param {function(data?)} config.open  - Called when this target should become visible
     * @param {function(data?)} config.close - Called when this target should be hidden
     */
    function register(id, config) {
        _handlers[id] = config;
    }

    // --- State serialization ---

    function _buildState() {
        return {
            _nav: true,
            tab: _currentTab,
            subview: _subview ? { id: _subview.id, data: _subview.data } : null,
            modals: _modalStack.map(function (m) { return { id: m.id, data: m.data }; })
        };
    }

    // --- Tab switching ---

    /**
     * Switch to a tab. Closes all open modals and subviews first.
     * Pushes a new history entry so back returns to the previous tab.
     */
    function switchTab(tabId) {
        if (!_handlers[tabId]) {
            console.warn('[nav] Unknown tab:', tabId);
            return;
        }
        if (_currentTab === tabId && _modalStack.length === 0 && !_subview) {
            return; // Already here with nothing on top
        }

        // Close all modals (top to bottom)
        _closeAllModals();

        // Close subview
        _closeSubview();

        // Deactivate previous tab
        var prevHandler = _handlers[_currentTab];
        if (prevHandler && prevHandler.close) prevHandler.close();

        // Activate new tab
        _currentTab = tabId;
        _handlers[tabId].open();

        history.pushState(_buildState(), '');
    }

    // --- Sub-views ---

    /**
     * Open a sub-view within the current tab (e.g. guide category, photographer detail).
     * Closes any open modals first.
     */
    function openSubview(id, data) {
        if (!_handlers[id]) {
            console.warn('[nav] Unknown subview:', id);
            return;
        }

        // Close modals
        _closeAllModals();

        // Close previous subview if different
        if (_subview && _subview.id === id && JSON.stringify(_subview.data) === JSON.stringify(data)) {
            return; // Same subview, same data
        }
        _closeSubview();

        _subview = { id: id, data: data };
        _handlers[id].open(data);

        history.pushState(_buildState(), '');
    }

    // --- Modals ---

    /**
     * Open a modal on top of everything.
     * Multiple modals can stack (e.g. detail + fullscreen on top).
     */
    function openModal(id, data) {
        if (!_handlers[id]) {
            console.warn('[nav] Unknown modal:', id);
            return;
        }

        _modalStack.push({ id: id, data: data });
        _handlers[id].open(data);

        history.pushState(_buildState(), '');
    }

    // --- Back ---

    /**
     * Go back one step. Equivalent to pressing the browser's back button.
     * Delegates to browser history which triggers popstate.
     */
    function back() {
        history.back();
    }

    // --- Internal helpers ---

    function _closeAllModals() {
        while (_modalStack.length > 0) {
            var m = _modalStack.pop();
            var h = _handlers[m.id];
            if (h && h.close) h.close(m.data);
        }
    }

    function _closeSubview() {
        if (_subview) {
            var h = _handlers[_subview.id];
            if (h && h.close) h.close(_subview.data);
            _subview = null;
        }
    }

    // --- Popstate handler ---

    function _onPopState(event) {
        if (_pausePopstate) return;

        var target = event.state;

        // If no state (e.g. initial page load), restore base
        if (!target || !target._nav) {
            _restoreBase();
            return;
        }

        _restoreState(target);
    }

    function _restoreBase() {
        _closeAllModals();
        _closeSubview();

        if (_currentTab !== 'log-view') {
            var prevH = _handlers[_currentTab];
            if (prevH && prevH.close) prevH.close();
            _currentTab = 'log-view';
            if (_handlers['log-view']) _handlers['log-view'].open();
        }
    }

    function _restoreState(target) {
        var targetModals = target.modals || [];

        // 1. Close modals that are above the target level
        while (_modalStack.length > targetModals.length) {
            var m = _modalStack.pop();
            var h = _handlers[m.id];
            if (h && h.close) h.close(m.data);
        }

        // 2. Handle subview changes
        var targetSub = target.subview;
        if (targetSub) {
            // Target has a subview
            if (!_subview || _subview.id !== targetSub.id ||
                JSON.stringify(_subview.data) !== JSON.stringify(targetSub.data)) {
                _closeSubview();
                _subview = { id: targetSub.id, data: targetSub.data };
                if (_handlers[targetSub.id]) _handlers[targetSub.id].open(targetSub.data);
            }
        } else {
            // Target has no subview
            _closeSubview();
        }

        // 3. Handle tab changes
        if (target.tab && target.tab !== _currentTab) {
            var prevH = _handlers[_currentTab];
            if (prevH && prevH.close) prevH.close();
            _currentTab = target.tab;
            if (_handlers[target.tab]) _handlers[target.tab].open();
        }

        // 4. Re-open modals if target has more than current (forward navigation)
        while (_modalStack.length < targetModals.length) {
            var tm = targetModals[_modalStack.length];
            _modalStack.push({ id: tm.id, data: tm.data });
            if (_handlers[tm.id]) _handlers[tm.id].open(tm.data);
        }
    }

    // --- Initialization ---

    /**
     * Initialize the navigation system. Call this after all handlers are registered.
     * @param {string} [initialTab='log-view'] - The starting tab
     */
    function init(initialTab) {
        _currentTab = initialTab || 'log-view';
        history.replaceState(_buildState(), '');
        window.addEventListener('popstate', _onPopState);
        _initialized = true;
    }

    // --- Public API ---

    return {
        register: register,
        switchTab: switchTab,
        openSubview: openSubview,
        openModal: openModal,
        back: back,
        init: init,

        // Read-only state access (for debugging and conditional logic)
        get currentTab() { return _currentTab; },
        get currentSubview() { return _subview; },
        get modalStack() { return _modalStack.slice(); },
        get isModalOpen() { return _modalStack.length > 0; },
        get hasSubview() { return _subview !== null; }
    };
})();
