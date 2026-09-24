const fs = require('fs');
const path = require('path');

// Load birds.js
const birdsFilePath = path.join(__dirname, '..', 'birds.js');
let fileContent = fs.readFileSync(birdsFilePath, 'utf8');

// Mock window to load swedishBirds
global.window = {};
eval(fileContent);

const birds = global.window.swedishBirds;
console.log(`Loaded ${birds.length} birds from birds.js`);

// Biotope mapping rule helper based on species ID, name, family/type and scientific name
function getBiotopeForBird(bird) {
    const id = bird.id;
    const name = bird.nameSv;
    const type = bird.type;
    const sci = bird.scientific || '';

    // Specific bird overrides for exact precision
    const SPECIFIC_BIOTOPES = {
        // Svanar & Gäss
        whooper_swan: "Klara insjöar, fuktängar & kuster",
        mute_swan: "Vassrika sjöar, dammar & skärgårdsvikar",
        bewick_swan: "Grunda sjöar, fuktängar & kuster",
        canada_goose: "Jordbruksmark, parker, sjöar & kuster",
        greylag_goose: "Strandängar, sjöar, kuster & åkrar",
        bean_goose: "Myrar, stubbåkrar & våtmarker",
        greater_white_fronted_goose: "Betesmarker, åkrar & fuktängar",
        pink_footed_goose: "Jordbruksmark, stubbåkrar & kuster",
        bar_headed_goose: "Sjöar, fuktängar & gräsmarker",
        barnacle_goose: "Strandängar, kuster & stadsparker",
        lesser_white_fronted_goose: "Fjällmyrar, sjöstränder & fuktängar",
        brent_goose: "Havskuster, tidalområden & strandängar",
        egyptian_goose: "Dammar, parkmiljöer & sjöstränder",
        snow_goose: "Jordbruksfält, kuster & våtmarker",
        
        // Änder
        common_shelduck: "Havskuster, sandstränder & långgrunda vikar",
        ruddy_shelduck: "Grunda sjöar, stäppvatten & fält",
        common_eider: "Havskuster, ytterskär & saltvatten",
        king_eider: "Arktiska kuster, ytterskär & öppet hav",
        stellers_eider: "Arktiska havskuster & grunda havsvikar",
        harlequin_duck: "Strömmande vattendrag, forsar & klipperkuster",
        long_tailed_duck: "Öppet hav, ytterskär & fjällsjöar",
        velvet_scoter: "Havskuster, skärgård & djupa skogssjöar",
        common_scoter: "Öppet hav, kuster & fjällsjöar",
        common_goldeneye: "Skogssjöar, floder & havsvikar",
        smew: "Klara skogssjöar, floder & kuster",
        goosander: "Fiskrika sjöar, skärgård & rinnande vatten",
        red_breasted_merganser: "Havskuster, skärgård & klara sjöar",
        mallard: "Sjöar, dammar, våtmarker & städer",
        gadwall: "Näringsrika, vassrika sjöar & dammar",
        northern_pintail: "Grunda våtmarker, strandängar & sjöar",
        eurasian_wigeon: "Vassrika sjöar, fuktängar & havsvikar",
        northern_shoveler: "Grunda vegetationsrika sjöar & dammar",
        common_teal: "Skogssjöar, myrar & våtmarker",
        garganey: "Vassrika näringsrika småsjöar & fuktängar",
        mandarin_duck: "Skogstjärnar, parkdammar & åar",
        tufted_duck: "Sjöar, dammar, skärgård & kuster",
        common_pochard: "Vassrika näringsrika sjöar & dammar",
        greater_scaup: "Tundrasjöar, havskuster & stora sjöar",

        // Hönsfåglar
        western_capercaillie: "Gammal tall- & barrskog",
        black_grouse: "Skogsbryn, tallmossar & hedmark",
        hazel_grouse: "Tät, fuktig barrskog med lövinslag",
        willow_ptarmigan: "Fjällbjörkskog, videbestånd & myrar",
        rock_ptarmigan: "Högfjäll, karga stenfält & hedar",
        common_pheasant: "Jordbrukslandskap, buskmarker & skogsbryn",
        grey_partridge: "Öppna fält, åkerholmar & kulturlandskap",
        common_quail: "Klöverfält, gräsmarker & jordbruksbygd",

        // Lommar & Doppingar
        black_throated_loon: "Klara insjöar & skärgård",
        red_throated_loon: "Småsjöar, fjälltärnar & kuster",
        great_crested_grebe: "Vassrika sjöar, dammar & skärgård",
        red_necked_grebe: "Mindre vassrika sjöar & skogstjärnar",
        horned_grebe: "Vegetationsrika insjöar & dammar",
        black_necked_grebe: "Näringsrika dammar & vassrika sjöar",
        little_grebe: "Små dammar, vegetationsrika åar & sjöar",

        // Hägrar & Pelikaner
        grey_heron: "Sjöstränder, vassbälten & skärgård",
        great_white_egret: "Grunda sjöar, fuktängar & våtmarker",
        eurasian_bittern: "Stora, täta vassbälten i näringsrika sjöar",
        white_stork: "Fuktängar, flodlandskap & jordbruksmark",
        black_stork: "Ödsliga skogsområden, bäckar & våtmarker",
        great_cormorant: "Skärgård, havskuster & stora sjöar",
        shag: "Branta klipperkuster & ytterskär",
        northern_gannet: "Öppet hav, fågelberg & ytterkust",

        // Rovfåglar
        white_tailed_eagle: "Skärgård, havsstränder & stora sjöar",
        golden_eagle: "Ödsliga skogar, fjäll & bergsklippor",
        western_osprey: "Klara fiskrika sjöar & skärgård",
        red_kite: "Öppna kulturlandskap & lövskogsbryn",
        black_kite: "Våtmarker, sjöstränder & fält",
        european_honey_buzzard: "Löv- & blandskog med öppna ytor",
        common_buzzard: "Öppna fält, jordbruksmark & skogsbryn",
        rough_legged_buzzard: "Fjällhedar, karga myrar & öppna fält",
        western_marsh_harrier: "Vassbälten, fuktängar & våtmarker",
        hen_harrier: "Myrar, hedar, ungskog & öppna fält",
        montagu_harrier: "Öppna fält, hedar & fuktängar",
        northern_goshawk: "Gammal barrskog & större skogsområden",
        eurasian_sparrowhawk: "Blandskog, skogsbryn, parker & trädgårdar",
        gyrfalcon: "Högfjäll, branta bergsväggar & tundra",
        peregrine_falcon: "Bergsklippor, branta kuster & städer",
        eurasian_hobby: "Gles skog nära sjöar & våtmarker",
        common_kestrel: "Öppna fält, jordbruksbygd & städer",
        red_footed_falcon: "Öppna slätter, stäppmark & buskiga fält",
        merlin: "Fjällhedar, myrar & kuster",

        // Tranor & Rallar
        common_crane: "Myrar, fuktängar, våtmarker & åkrar",
        eurasian_coot: "Näringsrika sjöar, dammar & parkvatten",
        common_moorhen: "Vegetationsrika dammar, åar & vassvikar",
        corn_crake: "Slåtterängar, fuktiga gräsmarker & sädesfält",
        water_rail: "Täta vassbälten, starrängar & sumpmark",
        spotted_crake: "Fuktängar, starrkärr & grunda våtmarker",

        // Vadare
        eurasian_oystercatcher: "Havsstränder, skärgård & betade strandängar",
        grey_plover: "Arktisk tundra, lerflats & sandstränder",
        european_golden_plover: "Fjällhedar, myrar & öppna fält",
        eurasian_dotterel: "Karga fjällhedar & vindblottade toppar",
        ringed_plover: "Sand- & grusstränder, kuster & sjöar",
        little_ringed_plover: "Grusgropsområden, flodbäddar & stränder",
        northern_lapwing: "Jordbruksmark, fuktängar & betesmarker",
        greenshank: "Skogsmyrar, fjällhedar & leriga stränder",
        spotted_redshank: "Glesa barrskogsmyrar & arktisk tundra",
        marsh_sandpiper: "Grunda våtmarker, fuktängar & sjöstränder",
        knot: "Arktisk tundra, lerflats & havsstränder",
        purple_sandpiper: "Klippiga havsstränder, skär & fjäll",
        curlew_sandpiper: "Arktisk tundra, tidalområden & stränder",
        green_sandpiper: "Skogstjärnar, skogsbäckar & blöta hyggen",
        wood_sandpiper: "Myrar, fuktängar & vegetationsrika sjöar",
        redshank: "Betade strandängar, marskland & kuster",
        common_sandpiper: "Steniga sjöstränder, bäckar & floder",
        broad_billed_sandpiper: "Våta starrmyrar & leriga havsstränder",
        ruff: "Fuktängar, myrar & leriga stränder",
        sanderling: "Sandstränder & våta sandrev",
        little_stint: "Arktisk tundra & leriga havsstränder",
        temminck_stint: "Fjällstränder, älvgrus & fuktängar",
        dunlin: "Strandängar, fjällmyrar & lerflats",
        jack_snipe: "Blöta starrmyrar, sumpmarker & fuktängar",
        common_snipe: "Fuktängar, myrar & blöta betesmarker",
        great_snipe: "Fjällmyrar, fuktiga starrängar & buskmark",
        eurasian_woodcock: "Fuktig löv- & blandskog med rik undervegetation",
        black_tailed_godwit: "Fuktiga betesängar & marskland",
        bar_tailed_godwit: "Arktisk tundra, lerflats & sandstränder",
        eurasian_curlew: "Fuktängar, jordbruksbygd & kuster",
        whimbrel: "Fjällhedar, myrar & havsstränder",
        red_necked_phalarope: "Fjällgölar, arktiska tärnar & öppet hav",
        grey_phalarope: "Arktisk tundra, tärnar & öppet hav",

        // Måsar, Tärnor, Labbar & Alkor
        herring_gull: "Havskuster, skärgård, sjöar & städer",
        great_black_backed_gull: "Ytterskär, havsstränder & öppet hav",
        lesser_black_backed_gull: "Skärgård, öar, kuster & städer",
        common_gull: "Kuster, sjöar, jordbruksmark & städer",
        black_headed_gull: "Insjöar, våtmarker, kuster & städer",
        little_gull: "Vassrika insjöar & vegetationsrika dammar",
        kittiwake: "Fågelberg, branta klippväggar & öppet hav",
        common_tern: "Skärgård, insjöar & grusöar",
        arctic_tern: "Ytterskär, arktiska kuster & tundra",
        caspian_tern: "Låga sand- & grusöar i skärgården",
        little_tern: "Sand- & grusstränder vid kusten",
        black_tern: "Vegetationsrika insjöar & sumpmarker",
        sandwich_tern: "Sandrev, kuster & låga skärgårdsöar",
        great_skua: "Havskuster, öar & öppet hav",
        arctic_skua: "Kusthedar, ytterskär & tundra",
        long_tailed_skua: "Fjällhedar, tundra & öppet hav",
        pomarine_skua: "Arktisk tundra & öppet hav",
        guillemot: "Branta fågelberg & öppet hav",
        razorbill: "Klippiga öar, skärgård & öppet hav",
        black_guillemot: "Steniga skärgårdsöar & kuster",
        puffin: "Gräsbevuxna fågelberg & öppet hav",
        little_auk: "Arktiska fågelberg & öppet hav",

        // Ugglor
        eurasian_eagle_owl: "Bergsbranter, skärgård & djupa skogar",
        tawny_owl: "Löv- & blandskog, parker & trädgårdar",
        ural_owl: "Gammal barrskog med gläntor & myrar",
        great_grey_owl: "Gammal granskog nära myrar & hyggen",
        boreal_owl: "Djupa barrskogar & skogskanter",
        eurasian_pygmy_owl: "Gammal barr- & blandskog",
        short_eared_owl: "Öppna myrar, fuktängar & hedar",
        long_eared_owl: "Skogsbryn, dungar nära öppna fält",
        snowy_owl: "Karg fjällhed, tundra & öppna fält",
        northern_hawk_owl: "Barrskog nära myrar & hyggen",

        // Hackspettar
        black_woodpecker: "Gammal barr- & blandskog",
        great_spotted_woodpecker: "Barr- & lövskog, parker & trädgårdar",
        lesser_spotted_woodpecker: "Lövskog, alridåer & parker",
        three_toed_woodpecker: "Gammal, orörd gran- & tallskog",
        green_woodpecker: "Lövskogsbryn, hagar & lövrik kulturbygd",
        grey_headed_woodpecker: "Gammal löv- & blandskog nära berg",
        eurasian_wryneck: "Öppna lövskogar, hagar & trädgårdar",

        // Duvor & Gökar
        common_cuckoo: "Skogar, buskmarker, heder & skogsbryn",
        common_wood_pigeon: "Skogar, jordbruksmark, parker & städer",
        stock_dove: "Gammal löv- & blandskog, hagar & parker",
        eurasian_collared_dove: "Bebyggelse, parker, trädgårdar & städer",
        rock_dove: "Städer, byggnader & bergsbranter",

        // Svalor & Seglare
        common_swift: "Luftrummet över städer, skogar & fält",
        barn_swallow: "Ladugårdar, jordbruksbygd & vattenbryn",
        house_martin: "Bebyggelse, byar & städer",
        sand_martin: "Sandtag, branta elvsbranter & sjöar",

        // Kråkfåglar
        common_raven: "Stora skogsområden, fjäll & skärgård",
        carrion_crow: "Jordbrukslandskap, skogsbryn & städer",
        hooded_crow: "Kulturlandskap, skogar, kuster & städer",
        rook: "Slättbygder, åkerbruk & alléer i städer",
        jackdaw: "Städer, jordbruksbygd & kyrkor/byggnader",
        eurasian_jay: "Barr- & lövskog, ekbackar & parker",
        spotted_nutcracker: "Gran- & hasselskog",
        siberian_jay: "Gammal, lavarik barrskog i norr",
        eurasian_magpie: "Jordbruksbygd, trädgårdar & städer",

        // Mesar, Titor & Trädkrypare
        great_tit: "Löv- & barrskog, parker & trädgårdar",
        blue_tit: "Lövskog, ekbackar, parker & trädgårdar",
        coal_tit: "Barrskog, särskilt tät granskog",
        crested_tit: "Gammal barrskog, särskilt tallmoar",
        marsh_tit: "Äldre lövskog, fuktiga lövdungar & parker",
        willow_tit: "Fuktig barr- & blandskog, tallmossar",
        long_tailed_tit: "Fuktig lövskog, snår & alridåer",
        bearded_reedling: "Stora, täta vassbälten vid insjöar & kuster",
        eurasian_nuthatch: "Gammal lövskog, parkmiljöer & ekdungar",
        eurasian_treecreeper: "Gammal barr- & blandskog",
        short_toed_treecreeper: "Lövskog, parker & gammal ekskog",

        // Lärkor, Ärlor & Piplärkor
        eurasian_skylark: "Öppna jordbruksfält, hedar & ängar",
        woodlark: "Soliga tallmoar, skogsbryn & hyggen",
        horned_lark: "Karga fjälltoppar, tundra & havsstränder",
        white_wagtail: "Öppna ytor, stränder, gårdsplaner & städer",
        yellow_wagtail: "Fuktängar, betesmarker & sjöstränder",
        grey_wagtail: "Snabbflödande bäckar, forsar & åar",
        tree_pipit: "Skogsbryn, hyggen & gles skog",
        meadow_pipit: "Fjällhedar, myrar, strandängar & fält",
        rock_pipit: "Klippiga havsstränder & ytterskär",
        red_throated_pipit: "Fjälltundra, myrar & fuktängar",

        // Trastar, Flugsnappare & Skvättor
        eurasian_blackbird: "Löv- & blandskog, parker & trädgårdar",
        fieldfare: "Skogsbryn, hagar, parker & jordbruksmark",
        song_thrush: "Tät barr- & blandskog",
        redwing: "Barrskog, fjällbjörkskog & parker",
        mistle_thrush: "Gles barrskog, tallmoar & skogsbryn",
        ring_ouzel: "Fjällbranter, stenig fjällterräng & hedar",
        european_robin: "Tät, fuktig barr- & blandskog samt trädgårdar",
        thrush_nightingale: "Fuktiga lövsnår, alridåer & buskmark",
        common_nightingale: "Lövskogssnår, buskage & flodstränder",
        common_redstart: "Gles barrskog, lövskogsbryn & parker",
        black_redstart: "Industriområden, stenbrott & städer",
        european_stonechat: "Öppna hedar, buskmarker & kustnära fält",
        whinchat: "Fuktängar, dikesrenar & öppna buskmarker",
        northern_wheatear: "Stenig mark, fjällhedar, beteshagar & kuster",
        spotted_flycatcher: "Gles skog, skogsbryn, parker & trädgårdar",
        european_piebaldflycatcher: "Löv- & blandskog, parker & trädgårdar",
        collared_flycatcher: "Äldre lövskog, ekbackar & lundar",
        red_breasted_flycatcher: "Gammal, skuggig löv- & gran-blandskog",

        // Sångare
        willow_warbler: "Lövskog, björkdungar, skogsbryn & trädgårdar",
        common_chiffchaff: "Blandskog, lövdungar, parker & buskage",
        wood_warbler: "Högstammig lövskog, bok- & ekskog",
        western_bonelli_warbler: "Soliga skogsbryn & gles lövskog",
        yellow_browed_warbler: "Taigaskog, lövdungar & buskmark",
        pallas_leaf_warbler: "Barr- & blandskog samt snår",
        eurasian_blackcap: "Löv- & blandskog med tät undervegetation",
        garden_warbler: "Lövskogssnår, buskrik mark & trädgårdar",
        greater_whitethroat: "Soliga buskmarker, dikesrenar & skogsbryn",
        lesser_whitethroat: "Täta buskage, enbackar & trädgårdshäckar",
        barred_warbler: "Buskrika hagar, enbackar & kustsnår",
        sedge_warbler: "Vassbälten, fuktiga buskmarker & dikesrenar",
        eurasian_reed_warbler: "Täta vassbälten i sjöar & dammar",
        great_reed_warbler: "Kraftiga, stora vassbälten i näringsrika sjöar",
        marsh_warbler: "Högörtsvegetation, fuktiga busksnår & dikesrenar",
        icterine_warbler: "Lövskogslundar, parker & lövrika trädgårdar",
        grasshopper_warbler: "Fuktgräsmarker, buskrika fält & dikesrenar",
        river_warbler: "Fuktig lövskog, alridåer & täta snår",
        savikopparsångare: "Täta vassbälten & sumpmark",

        // Törnskator & Starar
        red_backed_shrike: "Öppna buskmarker, enbackar & hyggen",
        great_grey_shrike: "Myrar, hedar, hyggen & öppna fält",
        woodchat_shrike: "Buskrika torra fält & gles skog",
        lesser_grey_shrike: "Öppna fält med enstaka träd & alléer",
        common_starling: "Jordbruksbygd, hagar, parker & städer",
        rosy_starling: "Öppna stäppmarker, betesfält & kuster",

        // Finkar, Sparvar & Stenknäckar
        chaffinch: "Löv- & barrskog, parker & trädgårdar",
        brambling: "Fjällbjörkskog, barrskog & blandskog",
        bullfinch: "Barr- & blandskog, parker & trädgårdar",
        greenfinch: "Lövskog, skogsbryn, parker & trädgårdar",
        goldfinch: "Odlingsbygd, ogräsmarker, parker & trädgårdar",
        eurasian_siskin: "Barr- & blandskog, klibbalbestånd",
        mealy_redpoll: "Fjällbjörkskog, björkdungar & ogräsmarker",
        arctic_redpoll: "Karg fjällbjörkskog & arktisk tundra",
        pine_grosbeak: "Gammal barrskog, gran- & tallskog i norr",
        red_crossbill: "Barrskog, framför allt granskog",
        parrot_crossbill: "Tallskog & tallmoar",
        two_barred_crossbill: "Lärkskogs- & granbestånd",
        hawfinch: "Äldre lövskog, bokskoga, ekbackar & parker",
        common_rosefinch: "Fuktiga lövsår, buskrika ängar & parker",
        yellowhammer: "Jordbrukslandskap, buskmarker & dikesrenar",
        reed_bunting: "Vassbälten, myrar, fuktängar & sjöstränder",
        snow_bunting: "Karga fjälltoppar, tundra & stenhällskuster",
        lapland_bunting: "Fjällhedar, tundra & öppna kuster",
        ortolan_bunting: "Jordbruksbygd, åkerholmar & skogsbryn",
        corn_bunting: "Öppna slättbygder & intensivt odlingslandskap",
        house_sparrow: "Städer, byar, gårdsplaner & bebyggelse",
        eurasian_tree_sparrow: "Jordbruksbygd, trädgårdar, parker & byar",

        // Övriga specialarter
        white_throated_dipper: "Snabbflödande bäckar, forsar & stenvattendrag",
        eurasian_wren: "Tät, snårig undervegetation i barr- & lövskog",
        goldcrest: "Tät granskog & barrskog",
        firecrest: "Löv- & blandskog samt parker",
        common_kingfisher: "Klara åar, bäckar, floder & dammar",
        eurasian_golden_oriole: "Högt i kronorna i gles lövskog & parker",
        hoopoe: "Torra, öppna kulturlandskap med träddungar",
        european_bee_eater: "Öppna soliga landskap med sandbranter",
        european_roller: "Öppen gles lövskog & hagar"
    };

    if (SPECIFIC_BIOTOPES[id]) {
        return SPECIFIC_BIOTOPES[id];
    }

    // Type fallback map
    const TYPE_FALLBACKS = {
        "Andfåglar": "Sjöar, våtmarker & kuster",
        "Hönsfåglar": "Barrskog, myrar & jordbruksmark",
        "Lommar & Doppingar": "Insjöar, dammar & kuster",
        "Hägrar": "Sjöstränder, vassbälten & våtmarker",
        "Rovfåglar": "Öppna fält, skogar & kuster",
        "Tranor & Rallar": "Myrar, fuktängar & vassbälten",
        "Vadare": "Havsstränder, fuktängar & våtmarker",
        "Måsar & Tärnor": "Havskuster, skärgård & insjöar",
        "Alkfåglar": "Fågelberg, skärgård & öppet hav",
        "Hackspettar": "Barr- & lövskog samt parker",
        "Ugglor": "Tät skog, bergsbranter & skogsbryn",
        "Duvor": "Jordbruksmark, skogar, parker & städer",
        "Skarvar": "Havskuster, skärgård & stora sjöar",
        "Gökfåglar": "Skogar, buskmarker & skogsbryn",
        "Svalor & Seglare": "Luftrummet över städer, fält & sjöar",
        "Starar": "Jordbruksbygd, hagar & städer",
        "Törnskator": "Öppna buskmarker, enbackar & hyggen",
        "Lärkor": "Öppna fält, hedar & strandängar",
        "Ärlor": "Stränder, fuktängar, åar & gårdsplaner",
        "Flugsnappare": "Löv- & blandskog, parker & trädgårdar",
        "Järnsparvar": "Barrskog, snår & buskmark",
        "Trädkrypare": "Gammal barr- & lövskog",
        "Sångare": "Lövskogssnår, vassbälten & buskmarker",
        "Trastar": "Löv- & barrskog, hagar, parker & trädgårdar",
        "Mesar": "Barr- & lövskog, trädgårdar & vassbälten",
        "Finkar": "Barr- & lövskog, parker & trädgårdar",
        "Sparvar": "Jordbruksmark, vassbälten, fält & bebyggelse",
        "Kråkfåglar": "Skogar, kulturlandskap & städer",
        "Labbar": "Öppet hav, kuster & fjällhedar",
        "Stormfåglar": "Öppet hav & klipperkuster",
        "Papegojor": "Parker, trädgårdar & stadsområden",
        "Övriga": "Skog & natur"
    };

    return TYPE_FALLBACKS[type] || "Skog & natur";
}

let updatedCount = 0;
birds.forEach(bird => {
    bird.habitat = getBiotopeForBird(bird);
    updatedCount++;
});

console.log(`Updated ${updatedCount} birds with precise Swedish habitats.`);

// Format output JSON nicely and replace in birds.js
const newJson = JSON.stringify(birds);
const newFileContent = `window.swedishBirds = ${newJson};\n`;

fs.writeFileSync(birdsFilePath, newFileContent, 'utf8');
console.log(`Successfully saved updated birds.js!`);
