begin;

select server_authority_private.begin_game_data_change(
  p_label => 'Normalize technical game keys to English',
  p_affected_families => array['zones', 'moves', 'items', 'species', 'progression', 'shop', 'battle-shop', 'combat-rules', 'zone-access', 'missions', 'opponents', 'admin-battles']::text[],
  -- Shared sources are synchronized across all matching manifests below.
  p_source_checksums => '{}'::jsonb,
  p_requires_battle_idle => true
);

update public.catalog_import_batch batch
set source_checksum = source.source_checksum,
    imported_at = now()
from (values
  ('app/data/capture-zones.js', '2c5f29be19fa04c58fc4546f258e53104b4449368716e3b21d4e7a43c238f9d8'),
  ('app/data/type-chart.js', '8a47bca565d108cdcb86f28d30022a108be27cf6804251ad54279ba912322212'),
  ('app/data/moves.js', 'd63fdd1b914bb5c448a0b0df1af798990cf02c9c8e6d23800d736a0312692814'),
  ('app/data/items.js', '0684d04b06c09a23c41635e666526085e1c73c7b502bc094917e0efaee8ddbed'),
  ('app/data/species_I.js', '32e11a20c0a399b3c798ad7315aed6113858d5b3e7bdac7fe7b88df2f1ea85f3'),
  ('app/data/species_II.js', 'f75b58af46f787b10512d887df03fedefc5937fe060e0279a6b2260925e5711e'),
  ('app/data/species_III.js', '171bc8fa85b7e5bedb9732a6afcfef377aa3b782cd551707b93c04a85cdb31e8'),
  ('app/data/progression.js', '608a51d805cb5240524e0ac4aaba6aa0aa4c2e29e789fd45881a5fdd4da82d80'),
  ('app/data/shopping-center.js', 'afcd66ab13e9991af5488eec0b605afb17c8a1d62057f00542398f2f915d2cfa'),
  ('app/data/battle-shop.js', 'd3c596331e7d9adbaf887293f4d9c2f0a1fd375e2621712b5a5a1ccd61d1ee16'),
  ('app/data/pokefan-missions.js', 'abd975d74ae300b23f438ccdb9f52b85e6a2390e403f782a24c091f825ee52e5'),
  ('app/data/gyms.js', 'c57289caf473af42ffc256a27ed00d0faf2b8b584a08fc94ee07d5af43f0cf56'),
  ('app/data/admin-battles.js', 'b822194da6ece17459436ec2eb8007ec8260250f2e35d728c9e6cbeef871a467')
) source(source_path, source_checksum)
where batch.catalog_release_id = (
    select id from public.catalog_release where version = 'revival-baseline'
  )
  and batch.family_key = any(array[
    'zones', 'moves', 'items', 'species', 'progression', 'shop',
    'battle-shop', 'combat-rules', 'zone-access', 'missions',
    'opponents', 'admin-battles'
  ]::text[])
  and batch.source_path = source.source_path;

-- Stable keys are renamed in place; display labels intentionally remain Italian.

alter table public.catalog_battle_shop_offer
  drop constraint catalog_battle_shop_offer_offer_key_check;

alter table public.catalog_species_type drop constraint catalog_species_type_catalog_release_id_type_key_fkey;

alter table public.catalog_species_type add constraint catalog_species_type_catalog_release_id_type_key_fkey foreign key (catalog_release_id, type_key) references public.catalog_type(catalog_release_id, type_key) on update cascade;

alter table public.catalog_type_effectiveness drop constraint catalog_type_effectiveness_catalog_release_id_attacker_typ_fkey;

alter table public.catalog_type_effectiveness add constraint catalog_type_effectiveness_catalog_release_id_attacker_typ_fkey foreign key (catalog_release_id, attacker_type_key) references public.catalog_type(catalog_release_id, type_key) on update cascade;

alter table public.catalog_type_effectiveness drop constraint catalog_type_effectiveness_catalog_release_id_defender_typ_fkey;

alter table public.catalog_type_effectiveness add constraint catalog_type_effectiveness_catalog_release_id_defender_typ_fkey foreign key (catalog_release_id, defender_type_key) references public.catalog_type(catalog_release_id, type_key) on update cascade;

alter table public.catalog_zone_type drop constraint catalog_zone_type_catalog_release_id_type_key_fkey;

alter table public.catalog_zone_type add constraint catalog_zone_type_catalog_release_id_type_key_fkey foreign key (catalog_release_id, type_key) references public.catalog_type(catalog_release_id, type_key) on update cascade;

alter table public.catalog_zone_type drop constraint catalog_zone_type_catalog_release_id_zone_key_fkey;

alter table public.catalog_zone_type add constraint catalog_zone_type_catalog_release_id_zone_key_fkey foreign key (catalog_release_id, zone_key) references public.catalog_zone(catalog_release_id, zone_key) on update cascade on delete cascade;

alter table public.catalog_zone_access_requirement drop constraint catalog_zone_access_requiremen_catalog_release_id_zone_key_fkey;

alter table public.catalog_zone_access_requirement add constraint catalog_zone_access_requiremen_catalog_release_id_zone_key_fkey foreign key (catalog_release_id, zone_key) references public.catalog_zone(catalog_release_id, zone_key) on update cascade;

alter table public.catalog_opponent_pokemon drop constraint catalog_opponent_pokemon_catalog_release_id_opponent_key_fkey;

alter table public.catalog_opponent_pokemon add constraint catalog_opponent_pokemon_catalog_release_id_opponent_key_fkey foreign key (catalog_release_id, opponent_key) references public.catalog_opponent(catalog_release_id, opponent_key) on update cascade on delete cascade;

alter table public.catalog_opponent_reward drop constraint catalog_opponent_reward_catalog_release_id_opponent_key_fkey;

alter table public.catalog_opponent_reward add constraint catalog_opponent_reward_catalog_release_id_opponent_key_fkey foreign key (catalog_release_id, opponent_key) references public.catalog_opponent(catalog_release_id, opponent_key) on update cascade on delete cascade;

alter table public.catalog_opponent_move drop constraint catalog_opponent_move_catalog_release_id_opponent_key_poke_fkey;

alter table public.catalog_opponent_move add constraint catalog_opponent_move_catalog_release_id_opponent_key_poke_fkey foreign key (catalog_release_id, opponent_key, pokemon_slot_index) references public.catalog_opponent_pokemon(catalog_release_id, opponent_key, slot_index) on update cascade on delete cascade;

alter table public.player_gym_victory drop constraint player_gym_victory_catalog_release_id_opponent_key_fkey;

alter table public.player_gym_victory add constraint player_gym_victory_catalog_release_id_opponent_key_fkey foreign key (catalog_release_id, opponent_key) references public.catalog_opponent(catalog_release_id, opponent_key) on update cascade;



update public.catalog_move move set move_key = expected.move_key, display_name = expected.display_name, rules_key = 'move.' || expected.move_key, rules = jsonb_set(jsonb_set(move.rules, '{effectKeys,before}', case when move.rules #> '{effectKeys,before}' is null then 'null'::jsonb else to_jsonb('move.' || expected.move_key || '.before') end, false), '{effectKeys,after}', case when move.rules #> '{effectKeys,after}' is null then 'null'::jsonb else to_jsonb('move.' || expected.move_key || '.after') end, false) from (values
    (1, 'luster_purge', 'Abbagliante'),
    (2, 'fissure', 'Abisso'),
    (3, 'stockpile', 'Accumulo'),
    (4, 'acid', 'Acido'),
    (5, 'flatter', 'Adulazione'),
    (6, 'air_cutter', 'Aerasoio'),
    (7, 'aerial_ace', 'Aeroassalto'),
    (8, 'sky_attack', 'Aeroattacco'),
    (9, 'aeroblast', 'Aerocolpo'),
    (10, 'sharpen', 'Affilatore'),
    (11, 'agility', 'Agilità'),
    (12, 'steel_wing', 'Alacciaio'),
    (13, 'helping_hand', 'Altruismo'),
    (14, 'amnesia', 'Amnesia'),
    (15, 'aromatherapy', 'Aromaterapia'),
    (16, 'assist', 'Assistente'),
    (17, 'absorb', 'Assorbimento'),
    (18, 'torment', 'Attaccalite'),
    (19, 'wing_attack', 'Attacco d''Ala'),
    (20, 'barrage', 'Attacco Pioggia'),
    (21, 'quick_attack', 'Attacco Rapido'),
    (22, 'attract', 'Attrazione'),
    (23, 'self_destruct', 'Autodistruzione'),
    (24, 'wrap', 'Avvolgibotta'),
    (25, 'tackle', 'Azione'),
    (26, 'uproar', 'Baraonda'),
    (27, 'barrier', 'Barriera'),
    (28, 'peck', 'Beccata'),
    (29, 'block', 'Blocco'),
    (30, 'roar', 'Boato'),
    (31, 'bubble', 'Bolla'),
    (32, 'bubble_beam', 'Bollaraggio'),
    (33, 'blizzard', 'Bora'),
    (34, 'pound', 'Botta'),
    (35, 'headbutt', 'Bottintesta'),
    (36, 'ember', 'Braciere'),
    (37, 'brick_break', 'Breccia'),
    (38, 'fake_out', 'Bruciapelo'),
    (39, 'swagger', 'Bullo'),
    (40, 'milk_drink', 'Buonlatte'),
    (41, 'rock_blast', 'Cadutamassi'),
    (42, 'blaze_kick', 'Calciardente'),
    (43, 'high_jump_kick', 'Calcinvolo'),
    (44, 'rolling_kick', 'Calciorullo'),
    (45, 'jump_kick', 'Calciosalto'),
    (46, 'calm_mind', 'Calmamente'),
    (47, 'camouflage', 'Camuffamento'),
    (48, 'sing', 'Canto'),
    (49, 'skull_bash', 'Capocciata'),
    (50, 'waterfall', 'Cascata'),
    (51, 'focus_punch', 'Centripugno'),
    (52, 'kinesis', 'Cinèsi'),
    (53, 'iron_tail', 'Codacciaio'),
    (54, 'tail_glow', 'Codadiluce'),
    (55, 'thrash', 'Colpo'),
    (56, 'low_kick', 'Colpo Basso'),
    (57, 'tail_whip', 'Colpocoda'),
    (58, 'mud_shot', 'Colpodifango'),
    (59, 'karate_chop', 'Colpokarate'),
    (60, 'comet_punch', 'Cometapugno'),
    (61, 'swift', 'Comete'),
    (62, 'confusion', 'Confusione'),
    (63, 'counter', 'Contrattacco'),
    (64, 'reversal', 'Contropiede'),
    (65, 'conversion', 'Conversione'),
    (66, 'conversion_2', 'Conversione2'),
    (67, 'body_slam', 'Corposcontro'),
    (68, 'cosmic_power', 'Cosmoforza'),
    (69, 'cotton_spore', 'Cottonspora'),
    (70, 'soft_boiled', 'Covauova'),
    (71, 'growth', 'Crescita'),
    (72, 'feather_dance', 'Danzadipiume'),
    (73, 'swords_dance', 'Danzaspada'),
    (74, 'lovely_kiss', 'Demonbacio'),
    (75, 'wish', 'Desiderio'),
    (76, 'destiny_bond', 'Destinobbligato'),
    (77, 'dynamic_punch', 'Dinamipugno'),
    (78, 'spite', 'Dispetto'),
    (79, 'future_sight', 'Divinazione'),
    (80, 'water_sport', 'Docciascudo'),
    (81, 'sweet_kiss', 'Dolcebacio'),
    (82, 'double_slap', 'Doppiasberla'),
    (83, 'twineedle', 'Doppio Ago'),
    (84, 'double_kick', 'Doppiocalcio'),
    (85, 'double_team', 'Doppioteam'),
    (86, 'dragon_claw', 'Dragartigli'),
    (87, 'dragon_dance', 'Dragodanza'),
    (88, 'dragon_breath', 'Dragospiro'),
    (89, 'eruption', 'Eruzione'),
    (90, 'imprison', 'Esclusiva'),
    (91, 'explosion', 'Esplosione'),
    (92, 'extreme_speed', 'Extrarapido'),
    (93, 'extrasensory', 'Extrasenso'),
    (94, 'facade', 'Facciata'),
    (95, 'zap_cannon', 'Falcecannone'),
    (96, 'fake_tears', 'Falselacrime'),
    (97, 'false_swipe', 'Falsofinale'),
    (98, 'mud_sport', 'Fangata'),
    (99, 'muddy_water', 'Fanghiglia'),
    (100, 'sludge', 'Fango'),
    (101, 'sludge_bomb', 'Fangobomba'),
    (102, 'mud_slap', 'Fangosberla'),
    (103, 'charm', 'Fascino'),
    (104, 'leaf_blade', 'Fendifoglia'),
    (105, 'metal_claw', 'Ferrartigli'),
    (106, 'iron_defense', 'Ferroscudo'),
    (107, 'metal_sound', 'Ferrostrido'),
    (108, 'feint_attack', 'Finta'),
    (109, 'flail', 'Flagello'),
    (110, 'flash', 'Flash'),
    (111, 'focus_energy', 'Focalenergia'),
    (112, 'magical_leaf', 'Fogliamagica'),
    (113, 'razor_leaf', 'Foglielama'),
    (114, 'strength', 'Forza'),
    (115, 'ancient_power', 'Forzantica'),
    (116, 'secret_power', 'Forzasegreta'),
    (117, 'mist_ball', 'Foschisfera'),
    (118, 'dig', 'Fossa'),
    (119, 'rock_slide', 'Frana'),
    (120, 'vine_whip', 'Frustata'),
    (121, 'frustration', 'Frustrazione'),
    (122, 'thunderbolt', 'Fulmine'),
    (123, 'leer', 'Fulmisguardo'),
    (124, 'fire_blast', 'Fuocobomba'),
    (125, 'will_o_wisp', 'Fuocofatuo'),
    (126, 'fire_punch', 'Fuocopugno'),
    (127, 'fury_attack', 'Furia'),
    (128, 'thief', 'Furto'),
    (129, 'icicle_spear', 'Gelolancia'),
    (130, 'ice_punch', 'Gelopugno'),
    (131, 'ice_beam', 'Geloraggio'),
    (132, 'guillotine', 'Ghigliottina'),
    (133, 'giga_drain', 'Gigassorbimento'),
    (134, 'sunny_day', 'Giornodisole'),
    (135, 'pay_day', 'Giornopaga'),
    (136, 'scratch', 'Graffio'),
    (137, 'hail', 'Grandine'),
    (138, 'bulk_up', 'Granfisico'),
    (139, 'hyper_voice', 'Granvoce'),
    (140, 'howl', 'Gridodilotta'),
    (141, 'hydro_pump', 'Idropompa'),
    (142, 'water_pulse', 'Idropulsar'),
    (143, 'horn_attack', 'Incornata'),
    (144, 'cross_chop', 'Incrocolpo'),
    (145, 'nightmare', 'Incubo'),
    (146, 'detect', 'Individua'),
    (147, 'disable', 'Inibitore'),
    (148, 'pursuit', 'Inseguimento'),
    (149, 'swallow', 'Introenergia'),
    (150, 'hidden_power', 'Introforza'),
    (151, 'hyper_beam', 'Iper Raggio'),
    (152, 'hyper_fang', 'Iperzanna'),
    (153, 'hypnosis', 'Ipnosi'),
    (349, 'hydro_cannon', 'Idrocannone'),
    (350, 'blast_burn', 'Incendio'),
    (154, 'rage', 'Ira'),
    (155, 'dragon_rage', 'Ira di Drago'),
    (156, 'slash', 'Lacerazione'),
    (157, 'flamethrower', 'Lanciafiamme'),
    (158, 'lick', 'Leccata'),
    (159, 'bind', 'Legatutto'),
    (160, 'mind_reader', 'Leggimente'),
    (161, 'constrict', 'Limitazione'),
    (162, 'lock_on', 'Localizza'),
    (348, 'volt_tackle', 'Locomovolt'),
    (163, 'moonlight', 'Lucelunare'),
    (164, 'sacred_fire', 'Magifuoco'),
    (165, 'magic_coat', 'Magivelo'),
    (166, 'magnitude', 'Magnitudo'),
    (167, 'pain_split', 'Malcomune'),
    (168, 'curse', 'Maledizione'),
    (169, 'mean_look', 'Malosguardo'),
    (170, 'dream_eater', 'Mangiasogni'),
    (171, 'smelling_salts', 'Maniereforti'),
    (172, 'crabhammer', 'Martellata'),
    (173, 'morning_sun', 'Mattindoro'),
    (174, 'meditate', 'Meditazione'),
    (175, 'mega_kick', 'Megacalcio'),
    (176, 'megahorn', 'Megacorno'),
    (177, 'mega_punch', 'Megapugno'),
    (178, 'mega_drain', 'Megassorbimento'),
    (179, 'grass_whistle', 'Meloderba'),
    (180, 'memento', 'Memento'),
    (181, 'meteor_mash', 'Meteorpugno'),
    (182, 'metronome', 'Metronomo'),
    (183, 'string_shot', 'Millebave'),
    (184, 'mimic', 'Mimica'),
    (185, 'minimize', 'Minimizzato'),
    (186, 'pin_missile', 'Missilspillo'),
    (187, 'bite', 'Morso'),
    (188, 'seismic_toss', 'Movimento Sismico'),
    (189, 'whirlpool', 'Mulinello'),
    (190, 'smokescreen', 'Muro di Fumo'),
    (191, 'nature_power', 'Naturforza'),
    (192, 'mist', 'Nebbia'),
    (193, 'haze', 'Nube'),
    (194, 'doom_desire', 'Desiderio Fatale'),
    (195, 'octazooka', 'Octazooka'),
    (196, 'outrage', 'Oltraggio'),
    (197, 'night_shade', 'Ombra Notturna'),
    (198, 'heat_wave', 'Ondacalda'),
    (199, 'shock_wave', 'Ondashock'),
    (200, 'bone_club', 'Ossoclava'),
    (201, 'bonemerang', 'Ossomerang'),
    (202, 'bone_rush', 'Ossoraffica'),
    (203, 'weather_ball', 'Palla Clima'),
    (204, 'ice_ball', 'Palla Gelo'),
    (205, 'shadow_ball', 'Palla Ombra'),
    (206, 'belly_drum', 'Panciamburo'),
    (207, 'stun_spore', 'Paralizzante'),
    (208, 'leech_seed', 'Parassiseme'),
    (209, 'bide', 'Pazienza'),
    (210, 'drill_peck', 'Perforbecco'),
    (211, 'horn_drill', 'Perforcorno'),
    (212, 'stomp', 'Pestone'),
    (213, 'petal_dance', 'Petalodanza'),
    (214, 'beat_up', 'Picchiaduro'),
    (215, 'slack_off', 'Pigro'),
    (216, 'rain_dance', 'Pioggiadanza'),
    (217, 'water_gun', 'Pistolacqua'),
    (218, 'powder_snow', 'Polneve'),
    (219, 'vise_grip', 'Presa'),
    (220, 'foresight', 'Preveggenza'),
    (221, 'knock_off', 'Privazione'),
    (222, 'sweet_scent', 'Profumino'),
    (223, 'protect', 'Protezione'),
    (224, 'taunt', 'Provocazione'),
    (225, 'psych_up', 'Psicamisù'),
    (226, 'psychic', 'Psichico'),
    (227, 'psywave', 'Psiconda'),
    (228, 'psybeam', 'Psicoraggio'),
    (229, 'psycho_boost', 'Psicoslancio'),
    (230, 'shadow_punch', 'Pugnodombra'),
    (231, 'mach_punch', 'Pugnorapido'),
    (232, 'needle_arm', 'Pugnospine'),
    (233, 'spikes', 'Punte'),
    (234, 'sheer_cold', 'Purogelo'),
    (235, 'ingrain', 'Radicamento'),
    (351, 'frenzy_plant', 'Radicalbero'),
    (236, 'gust', 'Raffica'),
    (237, 'harden', 'Rafforzatore'),
    (238, 'aurora_beam', 'Raggiaurora'),
    (239, 'trick', 'Raggiro'),
    (240, 'spider_web', 'Ragnatela'),
    (241, 'grudge', 'Rancore'),
    (242, 'rapid_spin', 'Rapigiro'),
    (243, 'present', 'Regalino'),
    (244, 'endure', 'Resistenza'),
    (245, 'defense_curl', 'Ricciolscudo'),
    (246, 'recycle', 'Riciclo'),
    (247, 'take_down', 'Riduttore'),
    (248, 'reflect', 'Riflesso'),
    (249, 'bounce', 'Rimbalzo'),
    (250, 'endeavor', 'Rimonta'),
    (251, 'refresh', 'Rinfrescata'),
    (252, 'heal_bell', 'Rintoccasana'),
    (253, 'encore', 'Ripeti'),
    (254, 'rest', 'Riposo'),
    (255, 'recover', 'Ripresa'),
    (256, 'withdraw', 'Ritirata'),
    (257, 'return_move', 'Ritorno'),
    (258, 'rock_tomb', 'Rocciotomba'),
    (259, 'rollout', 'Rotolamento'),
    (260, 'growl', 'Ruggito'),
    (261, 'flame_wheel', 'Ruotafuoco'),
    (262, 'snore', 'Russare'),
    (263, 'sand_tomb', 'Sabbiotomba'),
    (264, 'safeguard', 'Salvaguardia'),
    (265, 'leech_life', 'Sanguisuga'),
    (266, 'rock_throw', 'Sassata'),
    (267, 'yawn', 'Sbadiglio'),
    (268, 'arm_thrust', 'Sberletese'),
    (269, 'light_screen', 'Schermoluce'),
    (270, 'slam', 'Schianto'),
    (271, 'sketch', 'Schizzo'),
    (272, 'spark', 'Scintilla'),
    (273, 'snatch', 'Scippo'),
    (274, 'struggle', 'Scontro'),
    (275, 'acid_armor', 'Scudo Acido'),
    (276, 'double_edge', 'Sdoppiatore'),
    (277, 'signal_beam', 'Segnoraggio'),
    (278, 'odor_sleuth', 'Segugio'),
    (279, 'bullet_seed', 'Semitraglia'),
    (280, 'spit_up', 'Sfoghenergia'),
    (281, 'fury_swipes', 'Sfuriate'),
    (282, 'astonish', 'Sgomento'),
    (283, 'crunch', 'Sgranocchio'),
    (284, 'glare', 'Sguardo Feroce'),
    (285, 'synthesis', 'Sintesi'),
    (286, 'smog', 'Smog'),
    (287, 'solar_beam', 'Solarraggio'),
    (288, 'tickle', 'Solletico'),
    (289, 'sonic_boom', 'Sonicboom'),
    (290, 'sleep_powder', 'Sonnifero'),
    (291, 'sleep_talk', 'Sonnolalia'),
    (292, 'substitute', 'Sostituto'),
    (293, 'charge', 'Sottocarica'),
    (294, 'dive', 'Sub'),
    (295, 'submission', 'Sottomissione'),
    (296, 'rock_smash', 'Spaccaroccia'),
    (297, 'spike_cannon', 'Sparalance'),
    (298, 'mirror_coat', 'Specchiovelo'),
    (299, 'mirror_move', 'Speculmossa'),
    (300, 'splash', 'Splash'),
    (301, 'spore', 'Spora'),
    (302, 'baton_pass', 'Staffetta'),
    (303, 'dizzy_punch', 'Stordipugno'),
    (304, 'confuse_ray', 'Stordiraggio'),
    (305, 'sky_uppercut', 'Stramontante'),
    (306, 'teeter_dance', 'Strampadanza'),
    (307, 'screech', 'Stridio'),
    (308, 'supersonic', 'Supersuono'),
    (309, 'super_fang', 'Superzanna'),
    (310, 'covet', 'Supplica'),
    (311, 'surf', 'Surf'),
    (312, 'cut', 'Taglio'),
    (313, 'fury_cutter', 'Tagliofuria'),
    (314, 'teleport', 'Teletrasporto'),
    (315, 'clamp', 'Tenaglia'),
    (316, 'earthquake', 'Terremoto'),
    (317, 'sandstorm', 'Terrempesta'),
    (318, 'twister', 'Tornado'),
    (319, 'toxic', 'Tossina'),
    (320, 'transform', 'Trasformazione'),
    (321, 'tri_attack', 'Tripletta'),
    (322, 'triple_kick', 'Triplocalcio'),
    (323, 'crush_claw', 'Tritartigli'),
    (324, 'superpower', 'Troppoforte'),
    (325, 'thunder', 'Tuono'),
    (326, 'thunder_wave', 'Tuononda'),
    (327, 'thunder_punch', 'Tuonopugno'),
    (328, 'thunder_shock', 'Tuonoshock'),
    (329, 'whirlwind', 'Turbine'),
    (330, 'fire_spin', 'Turbofuoco'),
    (331, 'sand_attack', 'Turbosabbia'),
    (332, 'perish_song', 'Ultimocanto'),
    (333, 'egg_bomb', 'Uovobomba'),
    (334, 'overheat', 'Vampata'),
    (335, 'poison_tail', 'Velenocoda'),
    (336, 'poison_fang', 'Velenodenti'),
    (337, 'poison_gas', 'Velenogas'),
    (338, 'poison_sting', 'Velenospina'),
    (339, 'poison_powder', 'Velenpolvere'),
    (340, 'revenge', 'Vendetta'),
    (341, 'razor_wind', 'Ventagliente'),
    (342, 'silver_wind', 'Ventargenteo'),
    (343, 'icy_wind', 'Ventogelato'),
    (344, 'scary_face', 'Visotruce'),
    (345, 'vital_throw', 'Vitaltiro'),
    (346, 'fly', 'Volo'),
    (347, 'water_spout', 'Zampillo')
  ) expected(move_index, move_key, display_name) where move.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and move.move_index = expected.move_index;

update public.catalog_move move set rules = jsonb_set(move.rules, '{semiInvulnerableAllowedMoveKeys}', expected.allowed_keys::jsonb, false) from (values
    ('dig', '["earthquake","magnitude","shadow_punch","swift"]'),
    ('dive', '["shadow_punch","swift"]'),
    ('fly', '["gust","shadow_punch","sky_uppercut","swift","twister"]'),
    ('bounce', '["shadow_punch","swift"]')
  ) expected(move_key, allowed_keys) where move.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and move.move_key = expected.move_key;

update public.catalog_item item set item_key = expected.item_key, display_name = expected.display_name, category_key = expected.category_key, subcategory_key = expected.subcategory_key, rules = case when expected.allowed_species_keys is null then item.rules - 'allowedSpeciesNames' else (item.rules - 'allowedSpeciesNames') || jsonb_build_object('allowedSpeciesKeys', expected.allowed_species_keys::jsonb) end from (values
    (100, 'poke_ball', 'Poké Ball', 'ball', null, null),
    (101, 'great_ball', 'Mega Ball', 'ball', null, null),
    (102, 'ultra_ball', 'Ultra Ball', 'ball', null, null),
    (103, 'potion', 'Pozione', 'battle_item', 'heal_hp', null),
    (104, 'super_potion', 'Superpozione', 'battle_item', 'heal_hp', null),
    (105, 'hyper_potion', 'Iperpozione', 'battle_item', 'heal_hp', null),
    (106, 'max_potion', 'Pozione Max', 'battle_item', 'heal_hp', null),
    (107, 'full_restore', 'Ricarica Totale', 'battle_item', 'heal_full', null),
    (108, 'antidote', 'Antidoto', 'battle_item', 'heal_status', null),
    (109, 'paralyze_heal', 'Antiparalisi', 'battle_item', 'heal_status', null),
    (110, 'awakening', 'Sveglia', 'battle_item', 'heal_status', null),
    (111, 'burn_heal', 'Antiscottatura', 'battle_item', 'heal_status', null),
    (112, 'ice_heal', 'Antigelo', 'battle_item', 'heal_status', null),
    (113, 'full_heal', 'Cura Totale', 'battle_item', 'heal_status', null),
    (114, 'fresh_water', 'Acqua fresca', 'battle_item', 'heal_hp', null),
    (115, 'soda_pop', 'Gassosa', 'battle_item', 'heal_hp', null),
    (116, 'lemonade', 'Lemonsucco', 'battle_item', 'heal_hp', null),
    (117, 'moomoo_milk', 'Latte Mumu', 'battle_item', 'heal_hp', null),
    (118, 'clear_sky_elixir', 'Elisir Chiarocielo', 'battle_item', 'weather', null),
    (119, 'revive', 'Revitalizzante', 'battle_item', 'heal_ko', null),
    (120, 'max_revive', 'Revitalizzante Max', 'battle_item', 'heal_ko', null),
    (121, 'heal_powder', 'Polvocura', 'battle_item', 'heal_status', null),
    (122, 'energy_powder', 'Polvenergia', 'battle_item', 'heal_hp', null),
    (123, 'energy_root', 'Radicenergia', 'battle_item', 'heal_hp', null),
    (124, 'revival_herb', 'Vitalerba', 'battle_item', 'heal_ko', null),
    (200, 'mystic_water', 'Acqua magica', 'held_item', 'type_boost', null),
    (201, 'silver_powder', 'Argenpolvere', 'held_item', 'type_boost', null),
    (202, 'sharp_beak', 'Beccaffilato', 'held_item', 'type_boost', null),
    (203, 'magnet', 'Calamita', 'held_item', 'type_boost', null),
    (204, 'charcoal', 'Carbonella', 'held_item', 'type_boost', null),
    (205, 'black_belt', 'Cintura nera', 'held_item', 'type_boost', null),
    (206, 'twisted_spoon', 'Cucchiaio torto', 'held_item', 'type_boost', null),
    (207, 'dragon_fang', 'Dente di drago', 'held_item', 'type_boost', null),
    (208, 'never_melt_ice', 'Gelomai', 'held_item', 'type_boost', null),
    (209, 'metal_coat', 'Metalcopertura', 'held_item', 'type_boost', null),
    (210, 'miracle_seed', 'Miracolseme', 'held_item', 'type_boost', null),
    (211, 'black_glasses', 'Occhialineri', 'held_item', 'type_boost', null),
    (212, 'hard_stone', 'Pietradura', 'held_item', 'type_boost', null),
    (213, 'fairy_feather', 'Piuma fatata', 'held_item', 'type_boost', null),
    (214, 'soft_sand', 'Sabbia soffice', 'held_item', 'type_boost', null),
    (215, 'silk_scarf', 'Sciarpa seta', 'held_item', 'type_boost', null),
    (216, 'spell_tag', 'Spettrotarga', 'held_item', 'type_boost', null),
    (217, 'poison_barb', 'Velenaculeo', 'held_item', 'type_boost', null),
    (218, 'protector', 'Copertura', 'held_item', 'damage_item', null),
    (219, 'heavy_duty_boots', 'Scarponi robusti', 'held_item', 'misc', null),
    (220, 'lax_incense', 'Distraroma', 'held_item', 'status_item', null),
    (221, 'luck_incense', 'Fortunaroma', 'held_item', 'status_item', null),
    (222, 'pure_incense', 'Puroaroma', 'held_item', 'stats_item', null),
    (223, 'odd_incense', 'Bizzoaroma', 'held_item', 'misc', null),
    (224, 'full_incense', 'Gonfioaroma', 'held_item', 'misc', null),
    (225, 'light_ball', 'Elettropalla', 'held_item', 'damage_item', '["25"]'),
    (226, 'leek', 'Gambo', 'held_item', 'damage_item', '["83"]'),
    (227, 'lucky_punch', 'Fortunpugno', 'held_item', 'damage_item', '["113"]'),
    (228, 'thick_club', 'Osso spesso', 'held_item', 'damage_item', '["104","105"]'),
    (229, 'kings_rock', 'Roccia di re', 'held_item', 'status_item', null),
    (230, 'metronome', 'Plessimetro', 'held_item', 'damage_item', null),
    (231, 'life_orb', 'Assorbisfera', 'held_item', 'damage_item', null),
    (232, 'shell_bell', 'Conchinella', 'held_item', 'damage_item', null),
    (233, 'blunder_policy', 'Fiascopolizza', 'held_item', 'stats_item', null),
    (234, 'focus_band', 'Bandana', 'held_item', 'misc', null),
    (235, 'rocky_helmet', 'Bitorzolelmo', 'held_item', 'damage_item', null),
    (236, 'zoom_lens', 'Zoomlente', 'held_item', 'damage_item', null),
    (237, 'bright_powder', 'Luminpolvere', 'held_item', 'status_item', null),
    (238, 'focus_sash', 'Focalnastro', 'held_item', 'status_item', null),
    (300, 'cheri_berry', 'Baccaliegia', 'berry', 'heal_status', null),
    (301, 'chesto_berry', 'Baccastagna', 'berry', 'heal_status', null),
    (302, 'pecha_berry', 'Baccapesca', 'berry', 'heal_status', null),
    (303, 'rawst_berry', 'Baccafrago', 'berry', 'heal_status', null),
    (304, 'aspear_berry', 'Baccaperina', 'berry', 'heal_status', null),
    (305, 'oran_berry', 'Baccarancia', 'berry', 'heal_hp', null),
    (306, 'sitrus_berry', 'Baccacedro', 'berry', 'heal_hp', null),
    (307, 'persim_berry', 'Baccaki', 'berry', 'heal_status', null),
    (308, 'lum_berry', 'Baccaprugna', 'berry', 'heal_status', null),
    (309, 'occa_berry', 'Baccacao', 'berry', 'type_protection', null),
    (310, 'passho_berry', 'Baccapasflo', 'berry', 'type_protection', null),
    (311, 'wacan_berry', 'Baccaparmen', 'berry', 'type_protection', null),
    (312, 'rindo_berry', 'Baccarindo', 'berry', 'type_protection', null),
    (313, 'yache_berry', 'Baccamoya', 'berry', 'type_protection', null),
    (314, 'chople_berry', 'Baccarosmel', 'berry', 'type_protection', null),
    (315, 'kebia_berry', 'Baccakebia', 'berry', 'type_protection', null),
    (316, 'shuca_berry', 'Baccanaca', 'berry', 'type_protection', null),
    (317, 'coba_berry', 'Baccababa', 'berry', 'type_protection', null),
    (318, 'payapa_berry', 'Baccapayapa', 'berry', 'type_protection', null),
    (319, 'tanga_berry', 'Baccaitan', 'berry', 'type_protection', null),
    (320, 'charti_berry', 'Baccaciofo', 'berry', 'type_protection', null),
    (321, 'kasib_berry', 'Baccacitrus', 'berry', 'type_protection', null),
    (322, 'haban_berry', 'Baccahaban', 'berry', 'type_protection', null),
    (323, 'colbur_berry', 'Baccaxan', 'berry', 'type_protection', null),
    (324, 'babiri_berry', 'Baccababiri', 'berry', 'type_protection', null),
    (325, 'chilan_berry', 'Baccacinlan', 'berry', 'type_protection', null),
    (401, 'tm01', 'MT01 Centripugno', 'tm', null, null),
    (402, 'tm02', 'MT02 Dragartigli', 'tm', null, null),
    (403, 'tm03', 'MT03 Idropulsar', 'tm', null, null),
    (404, 'tm04', 'MT04 Calmamente', 'tm', null, null),
    (405, 'tm05', 'MT05 Boato', 'tm', null, null),
    (406, 'tm06', 'MT06 Tossina', 'tm', null, null),
    (407, 'tm07', 'MT07 Grandine', 'tm', null, null),
    (408, 'tm08', 'MT08 Granfisico', 'tm', null, null),
    (409, 'tm09', 'MT09 Semitraglia', 'tm', null, null),
    (410, 'tm10', 'MT10 Introforza', 'tm', null, null),
    (411, 'tm11', 'MT11 Giornodisole', 'tm', null, null),
    (412, 'tm12', 'MT12 Provocazione', 'tm', null, null),
    (413, 'tm13', 'MT13 Geloraggio', 'tm', null, null),
    (414, 'tm14', 'MT14 Bora', 'tm', null, null),
    (415, 'tm15', 'MT15 Iper Raggio', 'tm', null, null),
    (416, 'tm16', 'MT16 Schermoluce', 'tm', null, null),
    (417, 'tm17', 'MT17 Protezione', 'tm', null, null),
    (418, 'tm18', 'MT18 Pioggiadanza', 'tm', null, null),
    (419, 'tm19', 'MT19 Gigassorbimento', 'tm', null, null),
    (420, 'tm20', 'MT20 Salvaguardia', 'tm', null, null),
    (421, 'tm21', 'MT21 Frustrazione', 'tm', null, null),
    (422, 'tm22', 'MT22 Solarraggio', 'tm', null, null),
    (423, 'tm23', 'MT23 Codacciaio', 'tm', null, null),
    (424, 'tm24', 'MT24 Fulmine', 'tm', null, null),
    (425, 'tm25', 'MT25 Tuono', 'tm', null, null),
    (426, 'tm26', 'MT26 Terremoto', 'tm', null, null),
    (427, 'tm27', 'MT27 Ritorno', 'tm', null, null),
    (428, 'tm28', 'MT28 Fossa', 'tm', null, null),
    (429, 'tm29', 'MT29 Psichico', 'tm', null, null),
    (430, 'tm30', 'MT30 Palla Ombra', 'tm', null, null),
    (431, 'tm31', 'MT31 Breccia', 'tm', null, null),
    (432, 'tm32', 'MT32 Doppioteam', 'tm', null, null),
    (433, 'tm33', 'MT33 Riflesso', 'tm', null, null),
    (434, 'tm34', 'MT34 Ondashock', 'tm', null, null),
    (435, 'tm35', 'MT35 Lanciafiamme', 'tm', null, null),
    (436, 'tm36', 'MT36 Fangobomba', 'tm', null, null),
    (437, 'tm37', 'MT37 Terrempesta', 'tm', null, null),
    (438, 'tm38', 'MT38 Fuocobomba', 'tm', null, null),
    (439, 'tm39', 'MT39 Rocciotomba', 'tm', null, null),
    (440, 'tm40', 'MT40 Aeroassalto', 'tm', null, null),
    (441, 'tm41', 'MT41 Attaccalite', 'tm', null, null),
    (442, 'tm42', 'MT42 Facciata', 'tm', null, null),
    (443, 'tm43', 'MT43 Forzasegreta', 'tm', null, null),
    (444, 'tm44', 'MT44 Riposo', 'tm', null, null),
    (445, 'tm45', 'MT45 Attrazione', 'tm', null, null),
    (446, 'tm46', 'MT46 Furto', 'tm', null, null),
    (447, 'tm47', 'MT47 Alacciaio', 'tm', null, null),
    (448, 'tm48', 'MT48 Frana', 'tm', null, null),
    (449, 'tm49', 'MT49 Scippo', 'tm', null, null),
    (450, 'tm50', 'MT50 Vampata', 'tm', null, null),
    (451, 'tm51', 'MT51 Falcecannone', 'tm', null, null),
    (452, 'tm52', 'MT52 Dinamipugno', 'tm', null, null),
    (600, 'hp_up', 'PS-Su', 'vitamin', null, null),
    (601, 'pp_up', 'PP-Su', 'vitamin', null, null),
    (602, 'pp_max', 'PP-Max', 'vitamin', null, null),
    (603, 'felix_stone', 'Felixpietra', 'item', 'evolution_stone', null),
    (604, 'fire_stone', 'Pietrafocaia', 'item', 'evolution_stone', null),
    (605, 'thunder_stone', 'Pietratuono', 'item', 'evolution_stone', null),
    (606, 'water_stone', 'Pietraidrica', 'item', 'evolution_stone', null),
    (607, 'leaf_stone', 'Pietrafoglia', 'item', 'evolution_stone', null),
    (608, 'moon_stone', 'Pietralunare', 'item', 'evolution_stone', null),
    (609, 'sun_stone', 'Pietrasolare', 'item', 'evolution_stone', null),
    (610, 'deep_sea_tooth', 'Dente Abissi', 'item', 'evolution_stone', null),
    (611, 'deep_sea_scale', 'Squamabissi', 'item', 'evolution_stone', null),
    (612, 'prism_scale', 'Squama bella', 'item', 'evolution_stone', null),
    (613, 'upgrade', 'Upgrade', 'item', 'evolution_stone', null),
    (614, 'dragon_scale', 'Squama drago', 'item', 'evolution_stone', null),
    (615, 'linking_cord', 'Filo dell''unione', 'item', 'evolution_stone', null),
    (616, 'go_goggles', 'Occhialoni', 'item', 'unknown', null),
    (617, 'silph_scope', 'Spettrosonda', 'item', 'unknown', null),
    (618, 'white_flute', 'Flauto bianco', 'item', 'unknown', null),
    (619, 'black_flute', 'Flauto nero', 'item', 'unknown', null),
    (620, 'master_ball', 'Master Ball', 'ball', null, null),
    (621, 'heart_scale', 'Squama Cuore', 'item', 'move_tutor', null)
  ) expected(item_index, item_key, display_name, category_key, subcategory_key, allowed_species_keys) where item.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and item.item_index = expected.item_index;

update public.catalog_item item set rules = jsonb_set(item.rules, '{boostType}', to_jsonb(expected.new_key), false) from (values
    ('Normale', 'normal'),
    ('Fuoco', 'fire'),
    ('Acqua', 'water'),
    ('Elettro', 'electric'),
    ('Erba', 'grass'),
    ('Ghiaccio', 'ice'),
    ('Lotta', 'fighting'),
    ('Veleno', 'poison'),
    ('Terra', 'ground'),
    ('Volante', 'flying'),
    ('Psico', 'psychic'),
    ('Coleottero', 'bug'),
    ('Roccia', 'rock'),
    ('Spettro', 'ghost'),
    ('Drago', 'dragon'),
    ('Buio', 'dark'),
    ('Acciaio', 'steel'),
    ('Folletto', 'fairy')
  ) expected(old_key, new_key) where item.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and item.rules ->> 'boostType' = expected.old_key;

update public.catalog_item item set rules = jsonb_set(item.rules, '{requiredType}', to_jsonb(expected.new_key), false) from (values
    ('Normale', 'normal'),
    ('Fuoco', 'fire'),
    ('Acqua', 'water'),
    ('Elettro', 'electric'),
    ('Erba', 'grass'),
    ('Ghiaccio', 'ice'),
    ('Lotta', 'fighting'),
    ('Veleno', 'poison'),
    ('Terra', 'ground'),
    ('Volante', 'flying'),
    ('Psico', 'psychic'),
    ('Coleottero', 'bug'),
    ('Roccia', 'rock'),
    ('Spettro', 'ghost'),
    ('Drago', 'dragon'),
    ('Buio', 'dark'),
    ('Acciaio', 'steel'),
    ('Folletto', 'fairy')
  ) expected(old_key, new_key) where item.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and item.rules ->> 'requiredType' = expected.old_key;

update public.catalog_item item set rules = jsonb_set(item.rules, '{requiredMonoType}', to_jsonb(expected.new_key), false) from (values
    ('Normale', 'normal'),
    ('Fuoco', 'fire'),
    ('Acqua', 'water'),
    ('Elettro', 'electric'),
    ('Erba', 'grass'),
    ('Ghiaccio', 'ice'),
    ('Lotta', 'fighting'),
    ('Veleno', 'poison'),
    ('Terra', 'ground'),
    ('Volante', 'flying'),
    ('Psico', 'psychic'),
    ('Coleottero', 'bug'),
    ('Roccia', 'rock'),
    ('Spettro', 'ghost'),
    ('Drago', 'dragon'),
    ('Buio', 'dark'),
    ('Acciaio', 'steel'),
    ('Folletto', 'fairy')
  ) expected(old_key, new_key) where item.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and item.rules ->> 'requiredMonoType' = expected.old_key;

update public.catalog_item item set rules = jsonb_set(item.rules, '{protectType}', to_jsonb(expected.new_key), false) from (values
    ('Normale', 'normal'),
    ('Fuoco', 'fire'),
    ('Acqua', 'water'),
    ('Elettro', 'electric'),
    ('Erba', 'grass'),
    ('Ghiaccio', 'ice'),
    ('Lotta', 'fighting'),
    ('Veleno', 'poison'),
    ('Terra', 'ground'),
    ('Volante', 'flying'),
    ('Psico', 'psychic'),
    ('Coleottero', 'bug'),
    ('Roccia', 'rock'),
    ('Spettro', 'ghost'),
    ('Drago', 'dragon'),
    ('Buio', 'dark'),
    ('Acciaio', 'steel'),
    ('Folletto', 'fairy')
  ) expected(old_key, new_key) where item.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and item.rules ->> 'protectType' = expected.old_key;

update public.catalog_type type set type_key = expected.new_key, display_name = expected.display_name from (values
    ('Normale', 'normal', 'Normale'),
    ('Fuoco', 'fire', 'Fuoco'),
    ('Acqua', 'water', 'Acqua'),
    ('Elettro', 'electric', 'Elettro'),
    ('Erba', 'grass', 'Erba'),
    ('Ghiaccio', 'ice', 'Ghiaccio'),
    ('Lotta', 'fighting', 'Lotta'),
    ('Veleno', 'poison', 'Veleno'),
    ('Terra', 'ground', 'Terra'),
    ('Volante', 'flying', 'Volante'),
    ('Psico', 'psychic', 'Psico'),
    ('Coleottero', 'bug', 'Coleottero'),
    ('Roccia', 'rock', 'Roccia'),
    ('Spettro', 'ghost', 'Spettro'),
    ('Drago', 'dragon', 'Drago'),
    ('Buio', 'dark', 'Buio'),
    ('Acciaio', 'steel', 'Acciaio'),
    ('Folletto', 'fairy', 'Folletto')
  ) expected(old_key, new_key, display_name) where type.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and type.type_key = expected.old_key;

update public.catalog_zone zone set zone_key = expected.new_key, display_name = expected.display_name from (values
    ('Bosco Smeraldo', 'viridian_forest', 'Bosco Smeraldo'),
    ('Monte Luna', 'mt_moon', 'Monte Luna'),
    ('Mare', 'sea', 'Mare'),
    ('Torre Fantasma', 'ghost_tower', 'Torre Fantasma'),
    ('Safari', 'safari_zone', 'Safari'),
    ('Palude', 'swamp', 'Palude'),
    ('Deserto', 'desert', 'Deserto')
  ) expected(old_key, new_key, display_name) where zone.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and zone.zone_key = expected.old_key;

update public.catalog_rarity_rule rarity set rarity_key = expected.new_key from (values
    ('t', 'test'),
    ('c', 'common'),
    ('u', 'uncommon'),
    ('r', 'rare'),
    ('s', 'super_rare'),
    ('m', 'mythic'),
    ('f', 'fossil'),
    ('l', 'legendary')
  ) expected(old_key, new_key) where rarity.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and rarity.rarity_key = expected.old_key;

update public.catalog_species species set encounter_rarity_key = expected.new_key from (values
    ('t', 'test'),
    ('c', 'common'),
    ('u', 'uncommon'),
    ('r', 'rare'),
    ('s', 'super_rare'),
    ('m', 'mythic'),
    ('f', 'fossil'),
    ('l', 'legendary')
  ) expected(old_key, new_key) where species.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and species.encounter_rarity_key = expected.old_key;

update public.catalog_species_gender gender set gender_key = case gender.gender_key when 'Maschio' then 'male' when 'Femmina' then 'female' end where gender.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and gender.gender_key in ('Maschio', 'Femmina');

update public.catalog_shop_offer offer set offer_key = item.item_key from public.catalog_item item where offer.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and item.catalog_release_id = offer.catalog_release_id and item.item_index = offer.item_index;

update public.catalog_shop_offer offer set section_key = expected.new_key from (values
    ('MARKET', 'market'),
    ('PORT', 'port_market'),
    ('DEVON', 'devon_corporation'),
    ('MT', 'tm_shop'),
    ('SELL', 'sell')
  ) expected(old_key, new_key) where offer.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and offer.section_key = expected.old_key;

update public.catalog_shop_offer offer set category_key = expected.new_key from (values
    ('POKE_BALL', 'poke_balls'),
    ('HEALING', 'healing_items'),
    ('EVOLUTION_STONES', 'evolution_stones'),
    ('HERB', 'medicinal_herbs'),
    ('DRINK', 'drinks'),
    ('VITAMIN', 'vitamins'),
    ('COMPETITIVE', 'port_items'),
    ('TYPE_BOOSTERS', 'type_boosters'),
    ('DEVON', 'devon_items'),
    ('INCENSES', 'incenses'),
    ('FLUTES', 'flutes'),
    ('EVOLUTION_ITEMS', 'evolution_items'),
    ('MT', 'tms'),
    ('RARE', 'rare_items'),
    ('NONE', 'none')
  ) expected(old_key, new_key) where offer.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and offer.category_key = expected.old_key;

update public.catalog_shop_offer set stock_rules = jsonb_set(stock_rules, '{kind}', '"single_owned"'::jsonb, false) where catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and stock_rules ->> 'kind' = 'single-owned';

update public.catalog_battle_shop_offer set offer_key = 'item_' || item_index where catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and offer_kind = 'item';

update public.catalog_battle_shop_offer offer set offer_key = expected.offer_key from (values
    (122, 'pokemon_100'),
    (123, 'pokemon_500')
  ) expected(sort_order, offer_key) where offer.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and offer.offer_kind = 'pokemon' and offer.sort_order = expected.sort_order;

alter table public.catalog_battle_shop_offer
  add constraint catalog_battle_shop_offer_offer_key_check
  check (offer_key ~ '^[a-z0-9_]+$');

update public.catalog_progression_rule rule set rule_family = expected.new_key from (values
    ('badge-level-limit', 'badge_level_limit'),
    ('capture-level-limit', 'capture_level_limit'),
    ('capture-level-range', 'capture_level_range'),
    ('search-tool', 'search_tool'),
    ('training-difficulty', 'training_difficulty'),
    ('training-daily-reward', 'training_daily_reward'),
    ('training-repeat-reward', 'training_repeat_reward'),
    ('mt-tier', 'tm_tier'),
    ('gym-reward', 'gym_reward'),
    ('league-reward', 'league_reward'),
    ('item-unlock', 'item_unlock'),
    ('experience-multiplier', 'experience_multiplier')
  ) expected(old_key, new_key) where rule.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and rule.rule_family = expected.old_key;

update public.catalog_progression_rule rule set rule_key = expected.new_key from (values
    ('flute-daily-use-limit', 'flute_daily_use_limit'),
    ('garden-harvest-quantity', 'garden_harvest_quantity'),
    ('daycare-withdraw-base-cost', 'daycare_withdraw_base_cost'),
    ('daycare-withdraw-level-cost', 'daycare_withdraw_level_cost'),
    ('daycare-max-pending-levels', 'daycare_max_pending_levels'),
    ('daycare-level-interval-seconds', 'daycare_level_interval_seconds'),
    ('training-max-levels-per-pokemon', 'training_max_levels_per_pokemon')
  ) expected(old_key, new_key) where rule.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and rule.rule_family = 'constant' and rule.rule_key = expected.old_key;

update public.catalog_mission mission set mission_type = expected.mission_type, rules = expected.rules::jsonb, reward_rules = expected.reward_rules::jsonb from (values
    (2000, 'berries_harvested', '{}', '{"kind":"item","itemIndex":104,"quantity":3}'),
    (2001, 'training_victory', '{"difficulty":"easy"}', '{"kind":"item","itemIndex":100,"quantity":10}'),
    (2002, 'training_victory', '{"difficulty":"medium"}', '{"kind":"money","quantity":3000}'),
    (2003, 'held_item_assigned', '{}', '{"kind":"choice","choiceLabel":"Bacca a crescita veloce a scelta","choices":[{"kind":"item","itemIndex":300,"quantity":1,"label":"Baccaliegia"},{"kind":"item","itemIndex":301,"quantity":1,"label":"Baccastagna"},{"kind":"item","itemIndex":302,"quantity":1,"label":"Baccapesca"},{"kind":"item","itemIndex":303,"quantity":1,"label":"Baccafrago"},{"kind":"item","itemIndex":304,"quantity":1,"label":"Baccaperina"},{"kind":"item","itemIndex":305,"quantity":1,"label":"Baccarancia"},{"kind":"item","itemIndex":306,"quantity":1,"label":"Baccacedro"},{"kind":"item","itemIndex":307,"quantity":1,"label":"Baccaki"},{"kind":"item","itemIndex":308,"quantity":1,"label":"Baccaprugna"}]}'),
    (2004, 'training_victory', '{"difficulty":"hard","minTeamSize":3}', '{"kind":"item","itemIndex":119,"quantity":3}'),
    (2005, 'berries_harvested', '{}', '{"kind":"item","itemIndex":600,"quantity":2}'),
    (2006, 'zone_captures', '{}', '{"kind":"money","quantity":5000}'),
    (2007, 'distinct_species_level_up', '{}', '{"kind":"item","itemIndex":101,"quantity":10}'),
    (2008, 'training_victory', '{"difficulties":["medium","hard"],"distinctDays":true}', '{"kind":"item","itemIndex":105,"quantity":6}'),
    (2009, 'daycare_cycle_completed', '{}', '{"kind":"item","itemIndex":102,"quantity":10}'),
    (2010, 'training_victory', '{"difficulty":"hard","minTeamSize":4}', '{"kind":"money","quantity":10000}'),
    (2011, 'berries_harvested', '{}', '{"kind":"item","itemIndex":601,"quantity":2}'),
    (2012, 'distinct_species_evolved', '{}', '{"kind":"item","itemIndex":106,"quantity":6}'),
    (2013, 'training_victory', '{"difficulty":"hard","distinctDays":true}', '{"kind":"choice","choiceLabel":"Bacca a crescita lenta a scelta","choices":[{"kind":"item","itemIndex":309,"quantity":1,"label":"Baccacao"},{"kind":"item","itemIndex":310,"quantity":1,"label":"Baccapasflo"},{"kind":"item","itemIndex":311,"quantity":1,"label":"Baccaparmen"},{"kind":"item","itemIndex":312,"quantity":1,"label":"Baccarindo"},{"kind":"item","itemIndex":313,"quantity":1,"label":"Baccamoya"},{"kind":"item","itemIndex":314,"quantity":1,"label":"Baccarosmel"},{"kind":"item","itemIndex":315,"quantity":1,"label":"Baccakebia"},{"kind":"item","itemIndex":316,"quantity":1,"label":"Baccanaca"},{"kind":"item","itemIndex":317,"quantity":1,"label":"Baccababa"},{"kind":"item","itemIndex":318,"quantity":1,"label":"Baccapayapa"},{"kind":"item","itemIndex":319,"quantity":1,"label":"Baccaitan"},{"kind":"item","itemIndex":320,"quantity":1,"label":"Baccaciofo"},{"kind":"item","itemIndex":321,"quantity":1,"label":"Baccacitrus"},{"kind":"item","itemIndex":322,"quantity":1,"label":"Baccahaban"},{"kind":"item","itemIndex":323,"quantity":1,"label":"Baccaxan"},{"kind":"item","itemIndex":324,"quantity":1,"label":"Baccababiri"},{"kind":"item","itemIndex":325,"quantity":1,"label":"Baccacinlan"}]}'),
    (2014, 'training_victory', '{"difficulty":"hard","minTeamSize":6,"distinctDays":true}', '{"kind":"item","itemIndex":107,"quantity":6}'),
    (2015, 'zone_captures_after_badge', '{"minBadges":7}', '{"kind":"item","itemIndex":602,"quantity":2}'),
    (2016, 'training_victory', '{"difficulty":"hard","minTeamSize":6,"distinctDays":true}', '{"kind":"money","quantity":90000}'),
    (2017, 'zone_captures_after_badge', '{"minBadges":8}', '{"kind":"choice","choiceLabel":"Strumento del Porto a scelta","choices":[{"kind":"item","itemIndex":229,"quantity":1,"label":"Roccia di re"},{"kind":"item","itemIndex":234,"quantity":1,"label":"Bandana"},{"kind":"item","itemIndex":237,"quantity":1,"label":"Luminpolvere"},{"kind":"item","itemIndex":238,"quantity":1,"label":"Focalnastro"},{"kind":"item","itemIndex":600,"quantity":1,"label":"PS-Su"},{"kind":"item","itemIndex":601,"quantity":1,"label":"PP-Su"},{"kind":"item","itemIndex":602,"quantity":1,"label":"PP-Max"}]}'),
    (3000, 'zone_captures', '{}', '{"kind":"money","quantity":20000}'),
    (3001, 'zone_captures', '{}', '{"kind":"item","itemIndex":600,"quantity":10}'),
    (3002, 'zone_captures', '{}', '{"kind":"choice","choiceLabel":"MT acquistabile a scelta","choices":[{"kind":"item","itemIndex":401,"quantity":1,"label":"MT01 Centripugno"},{"kind":"item","itemIndex":402,"quantity":1,"label":"MT02 Dragartigli"},{"kind":"item","itemIndex":403,"quantity":1,"label":"MT03 Idropulsar"},{"kind":"item","itemIndex":404,"quantity":1,"label":"MT04 Calmamente"},{"kind":"item","itemIndex":405,"quantity":1,"label":"MT05 Boato"},{"kind":"item","itemIndex":406,"quantity":1,"label":"MT06 Tossina"},{"kind":"item","itemIndex":407,"quantity":1,"label":"MT07 Grandine"},{"kind":"item","itemIndex":408,"quantity":1,"label":"MT08 Granfisico"},{"kind":"item","itemIndex":409,"quantity":1,"label":"MT09 Semitraglia"},{"kind":"item","itemIndex":410,"quantity":1,"label":"MT10 Introforza"},{"kind":"item","itemIndex":411,"quantity":1,"label":"MT11 Giornodisole"},{"kind":"item","itemIndex":412,"quantity":1,"label":"MT12 Provocazione"},{"kind":"item","itemIndex":413,"quantity":1,"label":"MT13 Geloraggio"},{"kind":"item","itemIndex":414,"quantity":1,"label":"MT14 Bora"},{"kind":"item","itemIndex":415,"quantity":1,"label":"MT15 Iper Raggio"},{"kind":"item","itemIndex":416,"quantity":1,"label":"MT16 Schermoluce"},{"kind":"item","itemIndex":417,"quantity":1,"label":"MT17 Protezione"},{"kind":"item","itemIndex":418,"quantity":1,"label":"MT18 Pioggiadanza"},{"kind":"item","itemIndex":419,"quantity":1,"label":"MT19 Gigassorbimento"},{"kind":"item","itemIndex":420,"quantity":1,"label":"MT20 Salvaguardia"},{"kind":"item","itemIndex":421,"quantity":1,"label":"MT21 Frustrazione"},{"kind":"item","itemIndex":422,"quantity":1,"label":"MT22 Solarraggio"},{"kind":"item","itemIndex":423,"quantity":1,"label":"MT23 Codacciaio"},{"kind":"item","itemIndex":424,"quantity":1,"label":"MT24 Fulmine"},{"kind":"item","itemIndex":425,"quantity":1,"label":"MT25 Tuono"},{"kind":"item","itemIndex":426,"quantity":1,"label":"MT26 Terremoto"},{"kind":"item","itemIndex":427,"quantity":1,"label":"MT27 Ritorno"},{"kind":"item","itemIndex":428,"quantity":1,"label":"MT28 Fossa"},{"kind":"item","itemIndex":429,"quantity":1,"label":"MT29 Psichico"},{"kind":"item","itemIndex":430,"quantity":1,"label":"MT30 Palla Ombra"},{"kind":"item","itemIndex":431,"quantity":1,"label":"MT31 Breccia"},{"kind":"item","itemIndex":432,"quantity":1,"label":"MT32 Doppioteam"},{"kind":"item","itemIndex":433,"quantity":1,"label":"MT33 Riflesso"},{"kind":"item","itemIndex":434,"quantity":1,"label":"MT34 Ondashock"},{"kind":"item","itemIndex":435,"quantity":1,"label":"MT35 Lanciafiamme"},{"kind":"item","itemIndex":436,"quantity":1,"label":"MT36 Fangobomba"},{"kind":"item","itemIndex":437,"quantity":1,"label":"MT37 Terrempesta"},{"kind":"item","itemIndex":438,"quantity":1,"label":"MT38 Fuocobomba"},{"kind":"item","itemIndex":439,"quantity":1,"label":"MT39 Rocciotomba"},{"kind":"item","itemIndex":440,"quantity":1,"label":"MT40 Aeroassalto"},{"kind":"item","itemIndex":441,"quantity":1,"label":"MT41 Attaccalite"},{"kind":"item","itemIndex":442,"quantity":1,"label":"MT42 Facciata"},{"kind":"item","itemIndex":443,"quantity":1,"label":"MT43 Forzasegreta"},{"kind":"item","itemIndex":444,"quantity":1,"label":"MT44 Riposo"},{"kind":"item","itemIndex":445,"quantity":1,"label":"MT45 Attrazione"},{"kind":"item","itemIndex":446,"quantity":1,"label":"MT46 Furto"},{"kind":"item","itemIndex":447,"quantity":1,"label":"MT47 Alacciaio"},{"kind":"item","itemIndex":448,"quantity":1,"label":"MT48 Frana"},{"kind":"item","itemIndex":449,"quantity":1,"label":"MT49 Scippo"},{"kind":"item","itemIndex":450,"quantity":1,"label":"MT50 Vampata"},{"kind":"item","itemIndex":451,"quantity":1,"label":"MT51 Falcecannone"},{"kind":"item","itemIndex":452,"quantity":1,"label":"MT52 Dinamipugno"}],"purchasableNow":true}'),
    (3003, 'zone_captures', '{}', '{"kind":"pokemon_choice","choiceLabel":"Pokémon a scelta Lv5 (no Fossile, no Legend)","levelMode":"fixed_5","level":5,"excludeLegendary":true,"excludeFossils":true}'),
    (3004, 'zone_captures', '{}', '{"kind":"item","itemIndex":602,"quantity":10}'),
    (3005, 'zone_captures', '{}', '{"kind":"pokemon_choice","choiceLabel":"Pokémon a scelta max Lv allenabile (no Fossile, no Legend)","levelMode":"badge_cap","level":null,"excludeLegendary":true,"excludeFossils":true}'),
    (3006, 'pokedex_species_count', '{}', '{"kind":"choice","choiceLabel":"Strumento potenziatore del Tipo a scelta","choices":[{"kind":"item","itemIndex":200,"quantity":1,"label":"Acqua magica"},{"kind":"item","itemIndex":201,"quantity":1,"label":"Argenpolvere"},{"kind":"item","itemIndex":202,"quantity":1,"label":"Beccaffilato"},{"kind":"item","itemIndex":203,"quantity":1,"label":"Calamita"},{"kind":"item","itemIndex":204,"quantity":1,"label":"Carbonella"},{"kind":"item","itemIndex":205,"quantity":1,"label":"Cintura nera"},{"kind":"item","itemIndex":206,"quantity":1,"label":"Cucchiaio torto"},{"kind":"item","itemIndex":207,"quantity":1,"label":"Dente di drago"},{"kind":"item","itemIndex":208,"quantity":1,"label":"Gelomai"},{"kind":"item","itemIndex":209,"quantity":1,"label":"Metalcopertura"},{"kind":"item","itemIndex":210,"quantity":1,"label":"Miracolseme"},{"kind":"item","itemIndex":211,"quantity":1,"label":"Occhialineri"},{"kind":"item","itemIndex":212,"quantity":1,"label":"Pietradura"},{"kind":"item","itemIndex":213,"quantity":1,"label":"Piuma fatata"},{"kind":"item","itemIndex":214,"quantity":1,"label":"Sabbia soffice"},{"kind":"item","itemIndex":215,"quantity":1,"label":"Sciarpa seta"},{"kind":"item","itemIndex":216,"quantity":1,"label":"Spettrotarga"},{"kind":"item","itemIndex":217,"quantity":1,"label":"Velenaculeo"}]}'),
    (3007, 'pokedex_species_count', '{}', '{"kind":"item","itemIndex":102,"quantity":30}'),
    (3008, 'pokedex_species_count', '{}', '{"kind":"choice","choiceLabel":"Aroma a scelta","choices":[{"kind":"item","itemIndex":220,"quantity":1,"label":"Distraroma"},{"kind":"item","itemIndex":221,"quantity":1,"label":"Fortunaroma"},{"kind":"item","itemIndex":222,"quantity":1,"label":"Puroaroma"},{"kind":"item","itemIndex":223,"quantity":1,"label":"Bizzoaroma"},{"kind":"item","itemIndex":224,"quantity":1,"label":"Gonfioaroma"}]}'),
    (3009, 'pokedex_species_count', '{}', '{"kind":"item","itemIndex":621,"quantity":3}'),
    (3010, 'pokedex_species_count', '{}', '{"kind":"item","itemIndex":620,"quantity":1}'),
    (3011, 'pokedex_species_count', '{}', '{"kind":"pokemon_choice","choiceLabel":"Pokémon a scelta Lv5 (no Fossile)","levelMode":"fixed_5","level":5,"excludeLegendary":true,"excludeFossils":false}'),
    (1000, 'daily_login', '{"daily":true}', '{"kind":"dynamic_item","itemIndex":102,"baseQuantity":3,"perBadge":1}'),
    (1001, 'zone_captures', '{"daily":true}', '{"kind":"dynamic_money","baseQuantity":2000,"perBadge":500}'),
    (1002, 'training_difficulties', '{"difficulties":["easy","medium","hard"],"daily":true}', '{"kind":"choice","choiceLabel":"MT acquistabile a scelta","choices":[{"kind":"item","itemIndex":401,"quantity":1,"label":"MT01 Centripugno"},{"kind":"item","itemIndex":402,"quantity":1,"label":"MT02 Dragartigli"},{"kind":"item","itemIndex":403,"quantity":1,"label":"MT03 Idropulsar"},{"kind":"item","itemIndex":404,"quantity":1,"label":"MT04 Calmamente"},{"kind":"item","itemIndex":405,"quantity":1,"label":"MT05 Boato"},{"kind":"item","itemIndex":406,"quantity":1,"label":"MT06 Tossina"},{"kind":"item","itemIndex":407,"quantity":1,"label":"MT07 Grandine"},{"kind":"item","itemIndex":408,"quantity":1,"label":"MT08 Granfisico"},{"kind":"item","itemIndex":409,"quantity":1,"label":"MT09 Semitraglia"},{"kind":"item","itemIndex":410,"quantity":1,"label":"MT10 Introforza"},{"kind":"item","itemIndex":411,"quantity":1,"label":"MT11 Giornodisole"},{"kind":"item","itemIndex":412,"quantity":1,"label":"MT12 Provocazione"},{"kind":"item","itemIndex":413,"quantity":1,"label":"MT13 Geloraggio"},{"kind":"item","itemIndex":414,"quantity":1,"label":"MT14 Bora"},{"kind":"item","itemIndex":415,"quantity":1,"label":"MT15 Iper Raggio"},{"kind":"item","itemIndex":416,"quantity":1,"label":"MT16 Schermoluce"},{"kind":"item","itemIndex":417,"quantity":1,"label":"MT17 Protezione"},{"kind":"item","itemIndex":418,"quantity":1,"label":"MT18 Pioggiadanza"},{"kind":"item","itemIndex":419,"quantity":1,"label":"MT19 Gigassorbimento"},{"kind":"item","itemIndex":420,"quantity":1,"label":"MT20 Salvaguardia"},{"kind":"item","itemIndex":421,"quantity":1,"label":"MT21 Frustrazione"},{"kind":"item","itemIndex":422,"quantity":1,"label":"MT22 Solarraggio"},{"kind":"item","itemIndex":423,"quantity":1,"label":"MT23 Codacciaio"},{"kind":"item","itemIndex":424,"quantity":1,"label":"MT24 Fulmine"},{"kind":"item","itemIndex":425,"quantity":1,"label":"MT25 Tuono"},{"kind":"item","itemIndex":426,"quantity":1,"label":"MT26 Terremoto"},{"kind":"item","itemIndex":427,"quantity":1,"label":"MT27 Ritorno"},{"kind":"item","itemIndex":428,"quantity":1,"label":"MT28 Fossa"},{"kind":"item","itemIndex":429,"quantity":1,"label":"MT29 Psichico"},{"kind":"item","itemIndex":430,"quantity":1,"label":"MT30 Palla Ombra"},{"kind":"item","itemIndex":431,"quantity":1,"label":"MT31 Breccia"},{"kind":"item","itemIndex":432,"quantity":1,"label":"MT32 Doppioteam"},{"kind":"item","itemIndex":433,"quantity":1,"label":"MT33 Riflesso"},{"kind":"item","itemIndex":434,"quantity":1,"label":"MT34 Ondashock"},{"kind":"item","itemIndex":435,"quantity":1,"label":"MT35 Lanciafiamme"},{"kind":"item","itemIndex":436,"quantity":1,"label":"MT36 Fangobomba"},{"kind":"item","itemIndex":437,"quantity":1,"label":"MT37 Terrempesta"},{"kind":"item","itemIndex":438,"quantity":1,"label":"MT38 Fuocobomba"},{"kind":"item","itemIndex":439,"quantity":1,"label":"MT39 Rocciotomba"},{"kind":"item","itemIndex":440,"quantity":1,"label":"MT40 Aeroassalto"},{"kind":"item","itemIndex":441,"quantity":1,"label":"MT41 Attaccalite"},{"kind":"item","itemIndex":442,"quantity":1,"label":"MT42 Facciata"},{"kind":"item","itemIndex":443,"quantity":1,"label":"MT43 Forzasegreta"},{"kind":"item","itemIndex":444,"quantity":1,"label":"MT44 Riposo"},{"kind":"item","itemIndex":445,"quantity":1,"label":"MT45 Attrazione"},{"kind":"item","itemIndex":446,"quantity":1,"label":"MT46 Furto"},{"kind":"item","itemIndex":447,"quantity":1,"label":"MT47 Alacciaio"},{"kind":"item","itemIndex":448,"quantity":1,"label":"MT48 Frana"},{"kind":"item","itemIndex":449,"quantity":1,"label":"MT49 Scippo"},{"kind":"item","itemIndex":450,"quantity":1,"label":"MT50 Vampata"},{"kind":"item","itemIndex":451,"quantity":1,"label":"MT51 Falcecannone"},{"kind":"item","itemIndex":452,"quantity":1,"label":"MT52 Dinamipugno"}],"purchasableNow":true}')
  ) expected(mission_index, mission_type, rules, reward_rules) where mission.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and mission.mission_index = expected.mission_index;

update public.catalog_opponent opponent set opponent_key = expected.new_key from (values
    ('gym_plumbeopoli', 'gym_pewter_city'),
    ('gym_celestopoli', 'gym_cerulean_city'),
    ('gym_aranciopoli', 'gym_vermilion_city'),
    ('gym_azzurropoli', 'gym_celadon_city'),
    ('gym_zafferanopoli', 'gym_saffron_city'),
    ('gym_fucsiapoli', 'gym_fuchsia_city'),
    ('gym_isola-cannella', 'gym_cinnabar_island'),
    ('gym_smeraldopoli', 'gym_viridian_city')
  ) expected(old_key, new_key) where opponent.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and opponent.opponent_key = expected.old_key;

update public.catalog_opponent_pokemon pokemon set rules = jsonb_set(pokemon.rules, '{gender}', to_jsonb(case pokemon.rules ->> 'gender' when 'Maschio' then 'male' when 'Femmina' then 'female' end), false) where pokemon.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and pokemon.rules ->> 'gender' in ('Maschio', 'Femmina');

update public.catalog_admin_battle_type battle set battle_type = expected.new_key from (values
    ('gym_plumbeopoli', 'gym_pewter_city'),
    ('gym_celestopoli', 'gym_cerulean_city'),
    ('gym_aranciopoli', 'gym_vermilion_city'),
    ('gym_azzurropoli', 'gym_celadon_city'),
    ('gym_zafferanopoli', 'gym_saffron_city'),
    ('gym_fucsiapoli', 'gym_fuchsia_city'),
    ('gym_isola-cannella', 'gym_cinnabar_island'),
    ('gym_smeraldopoli', 'gym_viridian_city')
  ) expected(old_key, new_key) where battle.catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and battle.battle_type = expected.old_key;



-- Runtime functions consume only the new keys; no compatibility branches are retained.

CREATE OR REPLACE FUNCTION "public"."attach_edge_battle_tower_opponents"("p_auth_user_id" "uuid", "p_battle_id" "uuid", "p_npc_participants" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'pg_temp'
    AS $$
declare v_battle public.authoritative_battle%rowtype; v_entry jsonb; v_moves jsonb; v_item integer;
  v_team_size integer;
begin
  if coalesce(auth.role(),'')<>'service_role' then raise exception 'service role required' using errcode='42501'; end if;
  select * into strict v_battle from public.authoritative_battle where id=p_battle_id and auth_user_id=p_auth_user_id
    and contract_key='battle_tower' and engine_runtime_state='pending' for update;
  select count(*) into v_team_size from public.authoritative_battle_participant
    where battle_id=p_battle_id and side='player';
  if v_team_size not between 3 and 6 or jsonb_typeof(p_npc_participants)<>'array'
    or jsonb_array_length(p_npc_participants)<>v_team_size then
    raise exception 'Battle Tower NPC team size must match the player team size' using errcode='22023';
  end if;
  if exists(select 1 from public.authoritative_battle_participant where battle_id=p_battle_id and side='npc') then return; end if;
  for v_entry in select value from jsonb_array_elements(p_npc_participants) loop
    if v_entry->>'side'<>'npc' or server_authority_private.edge_jsonb_bigint(v_entry->'slot_index') not between 0 and v_team_size-1
      or coalesce(v_entry->>'species_key','')='' or server_authority_private.edge_jsonb_bigint(v_entry->'level') not between 5 and 100
      or server_authority_private.edge_jsonb_bigint(v_entry->'max_hp') not between 1 and 999
      or jsonb_typeof(v_entry->'moves')<>'array' or jsonb_array_length(v_entry->'moves') not between 1 and 4 then
      raise exception 'Battle Tower NPC participant is invalid' using errcode='22023';
    end if;
    if not exists(select 1 from public.catalog_species where catalog_release_id=v_battle.catalog_release_id
      and species_key=v_entry->>'species_key') then raise exception 'Battle Tower NPC species is not cataloged' using errcode='22023'; end if;
    v_item:=coalesce(server_authority_private.edge_jsonb_bigint(v_entry->'held_item_index'),0);
    if v_item>0 and not exists(select 1 from public.catalog_item where catalog_release_id=v_battle.catalog_release_id and item_index=v_item
      and category_key in ('held_item','berry')) then raise exception 'Battle Tower NPC held item is not cataloged' using errcode='22023'; end if;
    select jsonb_agg(jsonb_build_object('move_index',server_authority_private.edge_jsonb_bigint(move.value->'move_index'),
      'display_name',move.value->>'display_name','power',server_authority_private.edge_jsonb_bigint(move.value->'power'),
      'stats',server_authority_private.edge_jsonb_bigint(move.value->'stats')) order by move.ordinality) into v_moves
    from jsonb_array_elements(v_entry->'moves') with ordinality move(value,ordinality);
    if exists(select 1 from jsonb_array_elements(v_moves) value where not exists(select 1 from public.catalog_move catalog
      where catalog.catalog_release_id=v_battle.catalog_release_id and catalog.move_index=server_authority_private.edge_jsonb_bigint(value->'move_index'))) then
      raise exception 'Battle Tower NPC move is not cataloged' using errcode='22023';
    end if;
    insert into public.authoritative_battle_participant(battle_id,side,slot_index,pokemon_instance_id,species_key,display_name,level,max_hp,current_hp,type_keys,moves,source_snapshot)
    values(v_battle.id,'npc',server_authority_private.edge_jsonb_bigint(v_entry->'slot_index'),null,v_entry->>'species_key',v_entry->>'display_name',
      server_authority_private.edge_jsonb_bigint(v_entry->'level'),server_authority_private.edge_jsonb_bigint(v_entry->'max_hp'),
      server_authority_private.edge_jsonb_bigint(v_entry->'current_hp'),v_entry->'type_keys',v_moves,
      jsonb_build_object('s',v_entry->>'species_key','l',server_authority_private.edge_jsonb_bigint(v_entry->'level'),
        'hp',server_authority_private.edge_jsonb_bigint(v_entry->'max_hp'),'m',coalesce((select jsonb_agg(jsonb_build_array(
          server_authority_private.edge_jsonb_bigint(move.value->'move_index'),server_authority_private.edge_jsonb_bigint(move.value->'power'),
          server_authority_private.edge_jsonb_bigint(move.value->'stats')) order by move.ordinality)
          from jsonb_array_elements(v_entry->'moves') with ordinality move(value,ordinality)),'[]'::jsonb))
        || case when v_item>0 then jsonb_build_object('i',v_item) else '{}'::jsonb end);
  end loop;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."attach_edge_battle_tower_opponents_before_team_size"("p_auth_user_id" "uuid", "p_battle_id" "uuid", "p_npc_participants" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'pg_temp'
    AS $$
declare v_battle public.authoritative_battle%rowtype; v_entry jsonb; v_moves jsonb; v_item integer;
begin
  if coalesce(auth.role(),'')<>'service_role' then raise exception 'service role required' using errcode='42501'; end if;
  select * into strict v_battle from public.authoritative_battle where id=p_battle_id and auth_user_id=p_auth_user_id
    and contract_key='battle_tower' and engine_runtime_state='pending' for update;
  if jsonb_typeof(p_npc_participants)<>'array' or jsonb_array_length(p_npc_participants)<>6 then
    raise exception 'Battle Tower must initialize exactly six NPC participants' using errcode='22023';
  end if;
  if exists(select 1 from public.authoritative_battle_participant where battle_id=p_battle_id and side='npc') then return; end if;
  for v_entry in select value from jsonb_array_elements(p_npc_participants) loop
    if v_entry->>'side'<>'npc' or server_authority_private.edge_jsonb_bigint(v_entry->'slot_index') not between 0 and 5
      or coalesce(v_entry->>'species_key','')='' or server_authority_private.edge_jsonb_bigint(v_entry->'level') not between 5 and 100
      or server_authority_private.edge_jsonb_bigint(v_entry->'max_hp') not between 1 and 999
      or jsonb_typeof(v_entry->'moves')<>'array' or jsonb_array_length(v_entry->'moves') not between 1 and 4 then
      raise exception 'Battle Tower NPC participant is invalid' using errcode='22023';
    end if;
    if not exists(select 1 from public.catalog_species where catalog_release_id=v_battle.catalog_release_id
      and species_key=v_entry->>'species_key') then raise exception 'Battle Tower NPC species is not cataloged' using errcode='22023'; end if;
    v_item:=coalesce(server_authority_private.edge_jsonb_bigint(v_entry->'held_item_index'),0);
    if v_item>0 and not exists(select 1 from public.catalog_item where catalog_release_id=v_battle.catalog_release_id and item_index=v_item
      and category_key in ('held_item','berry')) then raise exception 'Battle Tower NPC held item is not cataloged' using errcode='22023'; end if;
    select jsonb_agg(jsonb_build_object('move_index',server_authority_private.edge_jsonb_bigint(move.value->'move_index'),
      'display_name',move.value->>'display_name','power',server_authority_private.edge_jsonb_bigint(move.value->'power'),
      'stats',server_authority_private.edge_jsonb_bigint(move.value->'stats')) order by move.ordinality) into v_moves
    from jsonb_array_elements(v_entry->'moves') with ordinality move(value,ordinality);
    if exists(select 1 from jsonb_array_elements(v_moves) value where not exists(select 1 from public.catalog_move catalog
      where catalog.catalog_release_id=v_battle.catalog_release_id and catalog.move_index=server_authority_private.edge_jsonb_bigint(value->'move_index'))) then
      raise exception 'Battle Tower NPC move is not cataloged' using errcode='22023';
    end if;
    insert into public.authoritative_battle_participant(battle_id,side,slot_index,pokemon_instance_id,species_key,display_name,level,max_hp,current_hp,type_keys,moves,source_snapshot)
    values(v_battle.id,'npc',server_authority_private.edge_jsonb_bigint(v_entry->'slot_index'),null,v_entry->>'species_key',v_entry->>'display_name',
      server_authority_private.edge_jsonb_bigint(v_entry->'level'),server_authority_private.edge_jsonb_bigint(v_entry->'max_hp'),
      server_authority_private.edge_jsonb_bigint(v_entry->'current_hp'),v_entry->'type_keys',v_moves,
      jsonb_build_object('s',v_entry->>'species_key','l',server_authority_private.edge_jsonb_bigint(v_entry->'level'),
        'hp',server_authority_private.edge_jsonb_bigint(v_entry->'max_hp'),'m',coalesce((select jsonb_agg(jsonb_build_array(
          server_authority_private.edge_jsonb_bigint(move.value->'move_index'),server_authority_private.edge_jsonb_bigint(move.value->'power'),
          server_authority_private.edge_jsonb_bigint(move.value->'stats')) order by move.ordinality)
          from jsonb_array_elements(v_entry->'moves') with ordinality move(value,ordinality)),'[]'::jsonb))
        || case when v_item>0 then jsonb_build_object('i',v_item) else '{}'::jsonb end);
  end loop;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."attempt_wild_capture_authoritative"("p_command_id" "uuid", "p_expected_revision" bigint, "p_encounter_id" "uuid", "p_ball_item_index" integer) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'extensions', 'pg_temp'
    AS $_$
declare
  v_auth_user_id uuid := auth.uid();
  v_profile public.player_profile_state%rowtype;
  v_encounter public.player_encounter%rowtype;
  v_ball public.catalog_item%rowtype;
  v_revision bigint;
  v_request jsonb;
  v_request_hash text;
  v_receipt record;
  v_rarity_multiplier numeric;
  v_hp_multiplier numeric;
  v_ball_rate numeric;
  v_catch_rate numeric;
  v_success boolean;
  v_instance_id uuid;
  v_pokemon_state jsonb;
  v_team_count integer;
  v_team_species_count integer;
  v_team_slot integer;
  v_box_index bigint;
  v_placement text;
  v_result jsonb;
begin
  if v_auth_user_id is null then raise exception 'authentication required' using errcode = '28000'; end if;
  if p_command_id is null or p_expected_revision is null or p_expected_revision < 0
     or p_encounter_id is null or p_ball_item_index is null or p_ball_item_index <= 0 then
    raise exception 'capture command inputs are invalid' using errcode = '22023';
  end if;
  v_request := jsonb_build_object('command_type', 'wild_capture_attempt', 'expected_revision', p_expected_revision,
    'encounter_id', p_encounter_id, 'ball_item_index', p_ball_item_index);
  v_request_hash := encode(digest(convert_to(v_request::text, 'UTF8'), 'sha256'), 'hex');
  perform pg_advisory_xact_lock(hashtextextended(v_auth_user_id::text || ':' || p_command_id::text, 0));
  select command_type, request_hash, result into v_receipt from public.player_command_receipt
  where auth_user_id = v_auth_user_id and command_id = p_command_id;
  if found then
    if v_receipt.command_type <> 'wild_capture_attempt' or v_receipt.request_hash <> v_request_hash then
      raise exception 'command id was already used with a different payload' using errcode = '22023';
    end if;
    return v_receipt.result;
  end if;

  select * into v_profile from public.player_profile_state where auth_user_id = v_auth_user_id for update;
  if not found then raise exception 'player profile is not ready' using errcode = 'P0002'; end if;
  select revision into v_revision from public.player_state_revision where auth_user_id = v_auth_user_id for update;
  if v_revision is null or v_revision <> p_expected_revision then
    raise exception 'revision conflict: expected %, current %', p_expected_revision, coalesce(v_revision, 0) using errcode = '40001';
  end if;
  select * into v_encounter from public.player_encounter
  where id = p_encounter_id and auth_user_id = v_auth_user_id for update;
  if not found then raise exception 'encounter was not found' using errcode = 'P0002'; end if;
  if v_encounter.status <> 'active' then raise exception 'encounter is not active' using errcode = '22023'; end if;
  if v_encounter.expires_at <= now() then
    update public.player_encounter set status = 'expired' where id = v_encounter.id;
    update public.player_state_revision set revision = revision + 1, updated_at = now()
    where auth_user_id = v_auth_user_id returning revision into v_revision;
    v_result := server_authority_private.player_state_projection(v_auth_user_id) || jsonb_build_object(
      'command_id', p_command_id, 'command_type', 'wild_capture_attempt',
      'capture_success', false, 'encounter_expired', true
    );
    insert into public.player_command_receipt(auth_user_id, command_id, command_type, request_hash, result, resulting_revision)
    values (v_auth_user_id, p_command_id, 'wild_capture_attempt', v_request_hash, v_result, v_revision);
    return v_result;
  end if;
  if v_encounter.species_key is null or v_encounter.current_hp is null or v_encounter.max_hp is null
     or v_encounter.current_hp < 0 or v_encounter.current_hp > v_encounter.max_hp then
    raise exception 'encounter canonical state is incomplete';
  end if;

  select * into v_ball from public.catalog_item
  where catalog_release_id = v_profile.catalog_release_id and item_index = p_ball_item_index;
  if not found or v_ball.category_key <> 'ball'
     or jsonb_typeof(v_ball.rules -> 'value') is distinct from 'number'
     or (v_ball.rules ->> 'value') !~ '^[0-9]+([.][0-9]+)?$' then
    raise exception 'item is not a supported capture ball' using errcode = '22023';
  end if;
  update public.player_inventory_item set quantity = quantity - 1, updated_at = now()
  where auth_user_id = v_auth_user_id and item_index = p_ball_item_index and quantity > 0;
  if not found then raise exception 'capture ball is not in inventory' using errcode = '22023'; end if;
  delete from public.player_inventory_item where auth_user_id = v_auth_user_id and item_index = p_ball_item_index and quantity = 0;

  select rarity.catch_multiplier into v_rarity_multiplier from public.catalog_rarity_rule rarity
  where rarity.catalog_release_id = v_encounter.catalog_release_id and rarity.rarity_key = v_encounter.rarity_key;
  select threshold.catch_multiplier into v_hp_multiplier from public.catalog_capture_hp_threshold threshold
  where threshold.catalog_release_id = v_encounter.catalog_release_id
    and v_encounter.current_hp::numeric / v_encounter.max_hp <= threshold.max_hp_fraction
  order by threshold.threshold_order limit 1;
  if v_rarity_multiplier is null or v_hp_multiplier is null then raise exception 'capture multiplier catalog is incomplete'; end if;
  v_ball_rate := (v_ball.rules ->> 'value')::numeric;
  v_catch_rate := least(100, greatest(0, v_ball_rate * v_rarity_multiplier * v_hp_multiplier));
  v_success := p_ball_item_index = 620 or random() * 100 < v_catch_rate;

  if v_success then
    v_instance_id := gen_random_uuid();
    v_pokemon_state := jsonb_build_object(
      's', v_encounter.species_key,
      'g', case v_encounter.gender_key when 'male' then 'male' when 'female' then 'female' else null end,
      'l', v_encounter.level, 'hp', v_encounter.max_hp, 'm', v_encounter.moves, 'xp', 0
    );
    insert into public.player_pokemon_instance(id, auth_user_id, catalog_release_id, species_key, state_version, state, revision)
    values (v_instance_id, v_auth_user_id, v_encounter.catalog_release_id, v_encounter.species_key, 1, v_pokemon_state, 1);
    select count(*) into v_team_count from public.player_pokemon_placement
    where auth_user_id = v_auth_user_id and placement_type = 'team';
    select count(*) into v_team_species_count
    from public.player_pokemon_placement placement join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
    where placement.auth_user_id = v_auth_user_id and placement.placement_type = 'team'
      and pokemon.species_key = v_encounter.species_key;
    if v_team_count < 6 and v_team_species_count < 2 then
      select slot into v_team_slot from generate_series(0, 5) slot
      where not exists (select 1 from public.player_pokemon_placement where auth_user_id = v_auth_user_id and placement_type = 'team' and slot_index = slot)
      order by slot limit 1;
      insert into public.player_pokemon_placement(pokemon_instance_id, auth_user_id, placement_type, slot_index, box_index)
      values (v_instance_id, v_auth_user_id, 'team', v_team_slot, null);
      v_placement := 'team';
    else
      insert into public.player_box_index_state(auth_user_id, next_box_index)
      select v_auth_user_id, coalesce(max(box_index), -1)::bigint + 1 from public.player_pokemon_placement
      where auth_user_id = v_auth_user_id and placement_type = 'box'
      on conflict (auth_user_id) do nothing;
      select next_box_index into v_box_index from public.player_box_index_state where auth_user_id = v_auth_user_id for update;
      select greatest(v_box_index, coalesce(max(box_index), -1)::bigint + 1) into v_box_index
      from public.player_pokemon_placement where auth_user_id = v_auth_user_id and placement_type = 'box';
      if v_box_index > 2147483647 then raise exception 'box index limit exceeded' using errcode = '22003'; end if;
      update public.player_box_index_state set next_box_index = v_box_index + 1, updated_at = now() where auth_user_id = v_auth_user_id;
      insert into public.player_pokemon_placement(pokemon_instance_id, auth_user_id, placement_type, slot_index, box_index)
      values (v_instance_id, v_auth_user_id, 'box', null, v_box_index::integer);
      v_placement := 'box';
    end if;
    insert into public.player_dex_entry(auth_user_id, catalog_release_id, species_key)
    values (v_auth_user_id, v_encounter.catalog_release_id, v_encounter.species_key) on conflict do nothing;
    update public.player_encounter set status = 'consumed', consumed_at = now(), captured_pokemon_instance_id = v_instance_id
    where id = v_encounter.id;
  end if;

  update public.player_state_revision set revision = revision + 1, updated_at = now()
  where auth_user_id = v_auth_user_id returning revision into v_revision;
  v_result := server_authority_private.player_state_projection(v_auth_user_id) || jsonb_build_object(
    'command_id', p_command_id, 'command_type', 'wild_capture_attempt', 'capture_success', v_success,
    'catch_rate', v_catch_rate, 'placement', v_placement, 'pokemon_instance_id', v_instance_id
  );
  insert into public.player_command_receipt(auth_user_id, command_id, command_type, request_hash, result, resulting_revision)
  values (v_auth_user_id, p_command_id, 'wild_capture_attempt', v_request_hash, v_result, v_revision);
  return v_result;
end;
$_$;

CREATE OR REPLACE FUNCTION "public"."buy_battle_shop_offer_before_revision_guard"("p_command_id" "uuid", "p_expected_revision" bigint, "p_offer_key" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'extensions', 'pg_temp'
    AS $_$
declare
  v_auth_user_id uuid:=auth.uid(); v_profile public.player_profile_state%rowtype;
  v_revision bigint; v_receipt public.player_command_receipt%rowtype; v_request jsonb; v_hash text;
  v_offer public.catalog_battle_shop_offer%rowtype; v_item public.catalog_item%rowtype;
  v_pool_key text; v_species_key text; v_selected_item_index integer; v_choice_group text;
  v_level integer; v_gender text; v_rule public.catalog_level_rule%rowtype; v_rule_60 public.catalog_level_rule%rowtype;
  v_base_hp integer; v_base_power integer; v_base_stats integer;
  v_max_hp integer; v_moves jsonb; v_instance_id uuid; v_box_index bigint; v_result jsonb;
begin
  if v_auth_user_id is null then raise exception 'Autenticazione richiesta' using errcode='28000'; end if;
  if p_command_id is null or p_expected_revision is null or p_expected_revision<0
    or coalesce(p_offer_key,'') !~ '^[a-z0-9_]+(:[0-9]+)?$' then
    raise exception 'Comando del Negozio Lotta non valido' using errcode='22023'; end if;
  v_request:=jsonb_build_object('expected_revision',p_expected_revision,'offer_key',p_offer_key);
  v_hash:=encode(digest(convert_to(v_request::text,'UTF8'),'sha256'),'hex');
  perform pg_advisory_xact_lock(hashtextextended(v_auth_user_id::text||':'||p_command_id::text,0));
  select * into v_receipt from public.player_command_receipt where auth_user_id=v_auth_user_id and command_id=p_command_id;
  if found then
    if v_receipt.command_type<>'battle_shop_buy' or v_receipt.request_hash<>v_hash then
      raise exception 'Identificativo comando giÃ  usato con un altro premio' using errcode='22023'; end if;
    return v_receipt.result;
  end if;
  select revision into v_revision from public.player_state_revision where auth_user_id=v_auth_user_id for update;
  if v_revision is null or v_revision<>p_expected_revision then raise exception 'Lo stato del giocatore Ã¨ cambiato. Aggiorna e riprova' using errcode='40001'; end if;
  select * into strict v_profile from public.player_profile_state where auth_user_id=v_auth_user_id for update;
  if v_profile.starter_status<>'selected' then raise exception 'Profilo giocatore non ancora pronto' using errcode='55000'; end if;
  v_pool_key:=split_part(p_offer_key,':',1); v_species_key:=nullif(split_part(p_offer_key,':',2),'');
  v_choice_group:=case v_pool_key when 'choice_berry_fast' then 'Bacca a crescita veloce'
    when 'choice_berry_slow' then 'Bacca a crescita lenta' when 'choice_tm' then 'tms'
    when 'choice_evolution' then 'Strumenti evolutivi' when 'choice_incense' then 'Aromi'
    when 'choice_type_booster' then 'Strumenti potenziatore Tipo' else null end;
  if v_choice_group is not null then
    if v_species_key is null then raise exception 'Scegli prima il premio da ritirare' using errcode='22023'; end if;
    v_selected_item_index:=v_species_key::integer;
    select * into v_offer from public.catalog_battle_shop_offer where catalog_release_id=v_profile.catalog_release_id
      and offer_kind='item' and item_index=v_selected_item_index and rules->>'group'=v_choice_group;
  else
    select * into v_offer from public.catalog_battle_shop_offer where catalog_release_id=v_profile.catalog_release_id and offer_key=v_pool_key;
  end if;
  if not found then raise exception 'Premio del Negozio Lotta non trovato' using errcode='22023'; end if;
  if (v_offer.offer_kind='item' and v_choice_group is null and v_species_key is not null)
    or (v_offer.offer_kind='pokemon' and v_species_key is null) then raise exception 'Premio del Negozio Lotta non valido' using errcode='22023'; end if;
  if v_profile.battle_points<v_offer.battle_point_price then raise exception 'Non hai abbastanza PL per ritirare questo premio' using errcode='22023'; end if;
  if v_offer.offer_kind='item' then
    select * into strict v_item from public.catalog_item where catalog_release_id=v_offer.catalog_release_id and item_index=v_offer.item_index;
    if v_item.category_key='tm' and v_profile.badges < (case coalesce((v_item.rules->>'tier')::integer,3)
      when 0 then 7 when 1 then 6 when 2 then 4 else 0 end) then raise exception 'Questa MT richiede piÃ¹ Medaglie' using errcode='22023'; end if;
    insert into public.player_inventory_item(auth_user_id,catalog_release_id,item_index,quantity,updated_at)
    values(v_auth_user_id,v_profile.catalog_release_id,v_offer.item_index,1,now())
    on conflict(auth_user_id,item_index) do update set quantity=player_inventory_item.quantity+1,updated_at=now();
  else
    if not exists(select 1 from server_authority_private.battle_shop_pokemon_candidates(v_profile.catalog_release_id,v_offer.offer_key,
      (select (rules->>'level')::integer from public.catalog_progression_rule where catalog_release_id=v_profile.catalog_release_id
        and rule_family='badge_level_limit' and rule_key=least(8,greatest(0,v_profile.badges))::text)) candidate where candidate.species_key=v_species_key) then
      raise exception 'Questo PokÃ©mon non Ã¨ disponibile' using errcode='22023'; end if;
    if exists(select 1 from public.player_ordinary_progression where auth_user_id=v_auth_user_id and status<>'completed') then
      raise exception 'Completa prima la progressione PokÃ©mon in sospeso' using errcode='55000'; end if;
    select (rules->>'level')::integer into v_level from public.catalog_progression_rule where catalog_release_id=v_profile.catalog_release_id
      and rule_family='badge_level_limit' and rule_key=least(8,greatest(0,v_profile.badges))::text;
    select gender_key into v_gender from public.catalog_species_gender where catalog_release_id=v_profile.catalog_release_id and species_key=v_species_key order by random() limit 1;
    select * into strict v_rule from public.catalog_level_rule where catalog_release_id=v_profile.catalog_release_id and level=v_level;
    select * into strict v_rule_60 from public.catalog_level_rule where catalog_release_id=v_profile.catalog_release_id and level=60;
    v_base_hp:=coalesce(v_rule.base_hp,v_rule_60.base_hp+greatest(0,v_level-60)*3);
    v_base_power:=coalesce(v_rule.base_power,v_rule_60.base_power+greatest(0,v_level-60)*2);
    v_base_stats:=coalesce(v_rule.base_stats,v_rule_60.base_stats+greatest(0,v_level-60)*2);
    if v_base_hp is null or v_base_power is null or v_base_stats is null then
      raise exception 'Valori del PokÃ©mon premio non disponibili' using errcode='22023'; end if;
    v_max_hp:=v_base_hp-floor(random()*(case when v_level>=35 then 5 when v_level>=15 then 3 else 1 end))::integer;
    select jsonb_agg(jsonb_build_array(move_index,v_base_power-floor(random()*(case when v_level>=50 then 5 when v_level>=20 then 4 when v_level>=10 then 3 else 1 end))::integer,v_base_stats-floor(random()*(case when v_level>=40 then 3 else 1 end))::integer) order by random_order) into v_moves
    from (select candidate.move_index,random() random_order from (select distinct level_move.move_index from public.catalog_species_level_move level_move where level_move.catalog_release_id=v_profile.catalog_release_id and level_move.species_key=v_species_key and level_move.level<=v_level) candidate order by random() limit 4) moves;
    if v_moves is null or jsonb_array_length(v_moves)=0 then raise exception 'Il PokÃ©mon non ha mosse valide a questo livello' using errcode='22023'; end if;
    v_instance_id:=gen_random_uuid();
    insert into public.player_pokemon_instance(id,auth_user_id,catalog_release_id,species_key,state_version,state,revision)
    values(v_instance_id,v_auth_user_id,v_profile.catalog_release_id,v_species_key,1,jsonb_build_object('s',v_species_key,'g',case v_gender when 'male' then 'male' when 'female' then 'female' else null end,'l',v_level,'hp',v_max_hp,'m',v_moves,'xp',0),1);
    insert into public.player_box_index_state(auth_user_id,next_box_index) select v_auth_user_id,coalesce(max(box_index),-1)::bigint+1 from public.player_pokemon_placement where auth_user_id=v_auth_user_id and placement_type='box' on conflict(auth_user_id) do nothing;
    select next_box_index into v_box_index from public.player_box_index_state where auth_user_id=v_auth_user_id for update;
    select greatest(v_box_index,coalesce(max(box_index),-1)::bigint+1) into v_box_index from public.player_pokemon_placement where auth_user_id=v_auth_user_id and placement_type='box';
    if v_box_index>2147483647 then raise exception 'Il Box ha raggiunto il limite massimo' using errcode='22003'; end if;
    update public.player_box_index_state set next_box_index=v_box_index+1,updated_at=now() where auth_user_id=v_auth_user_id;
    insert into public.player_pokemon_placement(pokemon_instance_id,auth_user_id,placement_type,slot_index,box_index) values(v_instance_id,v_auth_user_id,'box',null,v_box_index::integer);
    insert into public.player_dex_entry(auth_user_id,catalog_release_id,species_key) values(v_auth_user_id,v_profile.catalog_release_id,v_species_key) on conflict do nothing;
  end if;
  update public.player_profile_state set battle_points=battle_points-v_offer.battle_point_price,updated_at=now() where auth_user_id=v_auth_user_id;
  update public.player_state_revision set revision=revision+1,updated_at=now() where auth_user_id=v_auth_user_id returning revision into v_revision;
  v_result:=server_authority_private.player_state_projection(v_auth_user_id)||jsonb_build_object('command_id',p_command_id,'command_type','battle_shop_buy','offer_key',p_offer_key,'battle_point_price',v_offer.battle_point_price,'pokemon_instance_id',v_instance_id);
  insert into public.player_command_receipt(auth_user_id,command_id,command_type,request_hash,result,resulting_revision) values(v_auth_user_id,p_command_id,'battle_shop_buy',v_hash,v_result,v_revision);
  return v_result;
end;
$_$;

CREATE OR REPLACE FUNCTION "public"."choose_starter_authoritative"("p_command_id" "uuid", "p_expected_revision" bigint, "p_trainer_index" integer, "p_starter_species" "text", "p_gender" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'extensions', 'pg_temp'
    AS $$
declare
  v_auth_user_id uuid := auth.uid();
  v_catalog_release_id uuid;
  v_catalog_status text;
  v_allow_draft boolean;
  v_engine_contract text;
  v_species_key text;
  v_species_name text;
  v_dex_number integer;
  v_gender_options text[];
  v_gender text := nullif(btrim(p_gender), '');
  v_gender_code text;
  v_request jsonb;
  v_request_hash text;
  v_receipt_type text;
  v_receipt_hash text;
  v_receipt_result jsonb;
  v_current_revision bigint;
  v_pokemon_instance_id uuid := gen_random_uuid();
  v_pokemon_state jsonb;
  v_result jsonb;
begin
  if v_auth_user_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if p_command_id is null then
    raise exception 'command id is required' using errcode = '22023';
  end if;
  if p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'expected revision must be non-negative' using errcode = '22023';
  end if;
  if p_trainer_index is null or p_trainer_index < 1 or p_trainer_index > 38 then
    raise exception 'trainer index is not allowed' using errcode = '22023';
  end if;
  if nullif(btrim(p_starter_species), '') is null then
    raise exception 'starter species is required' using errcode = '22023';
  end if;

  v_request := jsonb_build_object(
    'command_type', 'choose_starter',
    'expected_revision', p_expected_revision,
    'trainer_index', p_trainer_index,
    'starter_species', btrim(p_starter_species),
    'gender', v_gender
  );
  v_request_hash := encode(digest(convert_to(v_request::text, 'UTF8'), 'sha256'), 'hex');

  perform pg_advisory_xact_lock(
    hashtextextended(v_auth_user_id::text || ':' || p_command_id::text, 0)
  );

  select command_type, request_hash, result
  into v_receipt_type, v_receipt_hash, v_receipt_result
  from public.player_command_receipt
  where auth_user_id = v_auth_user_id
    and command_id = p_command_id;

  if found then
    if v_receipt_type <> 'choose_starter' or v_receipt_hash <> v_request_hash then
      raise exception 'command id was already used with a different payload' using errcode = '22023';
    end if;
    return v_receipt_result;
  end if;

  insert into public.player_state_revision (auth_user_id, revision, updated_at)
  values (v_auth_user_id, 0, now())
  on conflict (auth_user_id) do nothing;

  select revision into v_current_revision
  from public.player_state_revision
  where auth_user_id = v_auth_user_id
  for update;

  if v_current_revision <> p_expected_revision then
    raise exception 'revision conflict: expected %, current %', p_expected_revision, v_current_revision
      using errcode = '40001';
  end if;
  if exists (
    select 1 from public.player_starter_selection
    where auth_user_id = v_auth_user_id
  ) or exists (
    select 1 from public.player_profile_state
    where auth_user_id = v_auth_user_id
      and starter_status = 'selected'
  ) then
    raise exception 'starter was already selected' using errcode = '23505';
  end if;

  select config.catalog_release_id, release.status, config.allow_draft, config.engine_contract
  into v_catalog_release_id, v_catalog_status, v_allow_draft, v_engine_contract
  from server_authority_private.runtime_catalog_config config
  join public.catalog_release release on release.id = config.catalog_release_id
  where config.runtime_key = 'starter';

  if v_catalog_release_id is null then
    raise exception 'starter runtime catalog is not configured';
  end if;
  if v_engine_contract <> 'starter' then
    raise exception 'starter engine contract is not ready';
  end if;
  if v_catalog_status <> 'published' and not (v_catalog_status = 'draft' and v_allow_draft) then
    raise exception 'starter runtime catalog is not ready: %', v_catalog_status;
  end if;
  if (
    select count(*) from public.catalog_item
    where catalog_release_id = v_catalog_release_id
      and item_index in (100, 103)
  ) <> 2 or not exists (
    select 1 from public.catalog_move
    where catalog_release_id = v_catalog_release_id
      and move_index = 25
      and move_key = 'tackle'
     
  ) then
    raise exception 'starter runtime catalog is incomplete';
  end if;

  select species.species_key, species.display_name, species.dex_number
  into v_species_key, v_species_name, v_dex_number
  from public.catalog_species species
  where species.catalog_release_id = v_catalog_release_id
    and species.species_key = btrim(p_starter_species);

  if v_species_key is null then
    raise exception 'starter species was not found' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.catalog_species species
    where species.catalog_release_id = v_catalog_release_id
      and species.species_key = v_species_key
      and species.rules ->> 'evolutionStage' = 'base'
      and coalesce(species.encounter_rarity_key, '') not in ('super_rare', 'fossil', 'mythic', 'legendary')
  ) then
    raise exception 'species is not an allowed starter' using errcode = '22023';
  end if;

  select coalesce(array_agg(gender.gender_key order by gender.gender_order), array[]::text[])
  into v_gender_options
  from public.catalog_species_gender gender
  where gender.catalog_release_id = v_catalog_release_id
    and gender.species_key = v_species_key;

  if cardinality(v_gender_options) = 0 then
    if v_gender is not null then
      raise exception 'gender is not valid for this species' using errcode = '22023';
    end if;
  elsif cardinality(v_gender_options) = 1 then
    if v_gender is not null and v_gender <> v_gender_options[1] then
      raise exception 'gender is not valid for this species' using errcode = '22023';
    end if;
    v_gender := v_gender_options[1];
  elsif v_gender is null or not (v_gender = any(v_gender_options)) then
    raise exception 'gender must be one of the species gender options' using errcode = '22023';
  end if;

  if v_gender is null then
    v_gender_code := null;
  elsif v_gender = 'male' then
    v_gender_code := 'male';
  elsif v_gender = 'female' then
    v_gender_code := 'female';
  else
    raise exception 'starter cannot project catalog gender: %', v_gender;
  end if;

  v_pokemon_state := jsonb_build_object(
    's', v_species_key,
    'g', v_gender_code,
    'l', 5,
    'hp', 23,
    'm', jsonb_build_array(jsonb_build_array(25, 4, 0)),
    'xp', 0
  );

  insert into public.player_profile_state (
    auth_user_id,
    catalog_release_id,
    trainer_index,
    pokedollars,
    badges,
    starter_status
  ) values (
    v_auth_user_id,
    v_catalog_release_id,
    p_trainer_index,
    5000,
    0,
    'selected'
  );

  insert into public.player_inventory_item (
    auth_user_id,
    catalog_release_id,
    item_index,
    quantity
  ) values
    (v_auth_user_id, v_catalog_release_id, 103, 3),
    (v_auth_user_id, v_catalog_release_id, 100, 5);

  insert into public.player_pokemon_instance (
    id,
    auth_user_id,
    catalog_release_id,
    species_key,
    state_version,
    state,
    revision
  ) values (
    v_pokemon_instance_id,
    v_auth_user_id,
    v_catalog_release_id,
    v_species_key,
    1,
    v_pokemon_state,
    1
  );

  insert into public.player_pokemon_placement (
    pokemon_instance_id,
    auth_user_id,
    placement_type,
    slot_index,
    box_index
  ) values (
    v_pokemon_instance_id,
    v_auth_user_id,
    'team',
    0,
    null
  );

  insert into public.player_dex_entry (
    auth_user_id,
    catalog_release_id,
    species_key
  ) values (
    v_auth_user_id,
    v_catalog_release_id,
    v_species_key
  );

  insert into public.player_starter_selection (
    auth_user_id,
    pokemon_instance_id,
    catalog_release_id,
    species_key,
    gender_key,
    command_id
  ) values (
    v_auth_user_id,
    v_pokemon_instance_id,
    v_catalog_release_id,
    v_species_key,
    v_gender,
    p_command_id
  );

  update public.player_state_revision
  set revision = revision + 1,
      updated_at = now()
  where auth_user_id = v_auth_user_id
  returning revision into v_current_revision;

  v_result := server_authority_private.player_state_projection(v_auth_user_id) || jsonb_build_object(
    'command_id', p_command_id,
    'command_type', 'choose_starter',
    'starter_species_name', v_species_name,
    'starter_dex_number', v_dex_number
  );

  insert into public.player_command_receipt (
    auth_user_id,
    command_id,
    command_type,
    request_hash,
    result,
    resulting_revision
  ) values (
    v_auth_user_id,
    p_command_id,
    'choose_starter',
    v_request_hash,
    v_result,
    v_current_revision
  );

  return v_result;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."claim_player_mission_before_revision_guard"("p_command_id" "uuid", "p_expected_revision" bigint, "p_mission_index" integer, "p_selected_reward_item_index" integer, "p_selected_reward_species_key" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'extensions', 'pg_temp'
    AS $_$
declare
  v_auth_user_id uuid:=auth.uid(); v_request jsonb; v_request_hash text;
  v_receipt public.player_command_receipt%rowtype; v_revision bigint;
  v_profile public.player_profile_state%rowtype; v_state public.player_mission_state%rowtype;
  v_mission public.catalog_mission%rowtype; v_reward jsonb; v_reward_kind text;
  v_reward_quantity bigint; v_reward_item_index integer; v_matching_choices integer;
  v_inventory_quantity integer:=0; v_reward_badges integer;
  v_species_key text; v_level integer; v_gender text; v_rule public.catalog_level_rule%rowtype;
  v_rule_60 public.catalog_level_rule%rowtype; v_base_hp integer; v_base_power integer;
  v_base_stats integer; v_max_hp integer; v_moves jsonb; v_instance_id uuid; v_box_index bigint;
  v_result jsonb;
begin
  if v_auth_user_id is null then raise exception 'Autenticazione richiesta' using errcode='28000'; end if;
  if p_command_id is null or p_expected_revision is null or p_expected_revision<0
    or p_mission_index is null or p_mission_index<=0 then
    raise exception 'Comando missione non valido' using errcode='22023'; end if;
  v_request:=jsonb_build_object('command_type','mission_claim','expected_revision',p_expected_revision,
    'mission_index',p_mission_index,'selected_reward_item_index',p_selected_reward_item_index,
    'selected_reward_species_key',p_selected_reward_species_key);
  v_request_hash:=encode(digest(convert_to(v_request::text,'UTF8'),'sha256'),'hex');
  perform pg_advisory_xact_lock(hashtextextended(v_auth_user_id::text||':'||p_command_id::text,0));
  select * into v_receipt from public.player_command_receipt
  where auth_user_id=v_auth_user_id and command_id=p_command_id;
  if found then
    if v_receipt.command_type<>'mission_claim' or v_receipt.request_hash<>v_request_hash then
      raise exception 'Identificativo comando giÃ  usato con un altro premio' using errcode='22023'; end if;
    return v_receipt.result;
  end if;
  select revision into v_revision from public.player_state_revision
  where auth_user_id=v_auth_user_id for update;
  if v_revision is null then raise exception 'Stato giocatore non trovato' using errcode='P0002'; end if;
  if v_revision<>p_expected_revision then
    raise exception 'Lo stato del giocatore Ã¨ cambiato. Aggiorna e riprova' using errcode='40001'; end if;
  select * into strict v_profile from public.player_profile_state
  where auth_user_id=v_auth_user_id for update;
  perform server_authority_private.sync_player_missions(v_auth_user_id);
  select * into v_state from public.player_mission_state
  where auth_user_id=v_auth_user_id and mission_index=p_mission_index for update;
  if not found then raise exception 'Missione non trovata' using errcode='P0002'; end if;
  select * into strict v_mission from public.catalog_mission
  where catalog_release_id=v_state.catalog_release_id and mission_index=v_state.mission_index;
  if v_state.claim_status<>'unclaimed' or v_state.counter<v_mission.target
    or not server_authority_private.mission_is_active(v_auth_user_id,p_mission_index) then
    raise exception 'La missione non Ã¨ completata e riscuotibile' using errcode='22023'; end if;

  v_reward:=v_mission.reward_rules; v_reward_kind:=v_reward->>'kind';
  if v_reward_kind='choice' then
    if p_selected_reward_species_key is not null or coalesce(p_selected_reward_item_index,0)<=0 then
      raise exception 'Scegli uno degli strumenti premio' using errcode='22023'; end if;
    select count(*)::integer into v_matching_choices
    from jsonb_array_elements(case when jsonb_typeof(v_reward->'choices')='array'
      then v_reward->'choices' else '[]'::jsonb end) choices(choice)
    where coalesce(choice->>'itemIndex','')~'^[1-9][0-9]*$'
      and choice->>'itemIndex'=p_selected_reward_item_index::text;
    if v_matching_choices<>1 then raise exception 'Lo strumento scelto non Ã¨ offerto' using errcode='22023'; end if;
    select choice into v_reward from jsonb_array_elements(v_reward->'choices') choices(choice)
    where choice->>'itemIndex'=p_selected_reward_item_index::text;
    v_reward_kind:=v_reward->>'kind';
  elsif v_reward_kind='pokemon_choice' then
    if p_selected_reward_item_index is not null or coalesce(p_selected_reward_species_key,'')!~'^[1-9][0-9]*$' then
      raise exception 'Scegli un PokÃ©mon premio' using errcode='22023'; end if;
    v_species_key:=p_selected_reward_species_key;
  elsif p_selected_reward_item_index is not null or p_selected_reward_species_key is not null then
    raise exception 'Questa ricompensa non richiede una scelta' using errcode='22023';
  end if;

  if v_reward_kind in ('dynamic_money','dynamic_item') then
    if v_mission.mission_type='daily_login' then
      select substring(key from '^reward_badges:([0-8])$')::integer into v_reward_badges
      from unnest(v_state.tracked_keys) key where key~'^reward_badges:[0-8]$' limit 1;
      if v_reward_badges is null then raise exception 'Livello premio Login non congelato' using errcode='55000'; end if;
    else v_reward_badges:=least(8,greatest(0,v_profile.badges)); end if;
    v_reward_quantity:=coalesce((v_reward->>'baseQuantity')::bigint,0)
      +v_reward_badges*coalesce((v_reward->>'perBadge')::bigint,0);
    if v_reward_quantity<=0 then raise exception 'Ricompensa dinamica non valida' using errcode='22023'; end if;
    if v_reward_kind='dynamic_money' then
      v_reward:=jsonb_build_object('kind','money','quantity',v_reward_quantity,'badgeCount',v_reward_badges);
      v_reward_kind:='money';
    else
      v_reward:=jsonb_build_object('kind','item','itemIndex',v_reward->'itemIndex',
        'quantity',v_reward_quantity,'badgeCount',v_reward_badges);
      v_reward_kind:='item';
    end if;
  end if;

  if v_reward_kind='money' then
    if coalesce(v_reward->>'quantity','')!~'^[1-9][0-9]*$' then raise exception 'Premio in denaro non valido'; end if;
    v_reward_quantity:=(v_reward->>'quantity')::bigint;
    if v_reward_quantity>9223372036854775807-v_profile.pokedollars then
      raise exception 'Limite PokÃ©dollari superato' using errcode='22003'; end if;
    update public.player_profile_state set pokedollars=pokedollars+v_reward_quantity,updated_at=now()
    where auth_user_id=v_auth_user_id;
  elsif v_reward_kind='item' then
    if coalesce(v_reward->>'itemIndex','')!~'^[1-9][0-9]*$'
      or coalesce(v_reward->>'quantity','')!~'^[1-9][0-9]*$' then
      raise exception 'Strumento premio non valido' using errcode='22023'; end if;
    v_reward_item_index:=(v_reward->>'itemIndex')::integer;
    v_reward_quantity:=(v_reward->>'quantity')::bigint;
    if not exists(select 1 from public.catalog_item where catalog_release_id=v_state.catalog_release_id
      and item_index=v_reward_item_index) then raise exception 'Strumento premio fuori catalogo'; end if;
    if coalesce((v_mission.reward_rules->>'purchasableNow')::boolean,false)
      and exists(select 1 from public.catalog_item item where item.catalog_release_id=v_state.catalog_release_id
        and item.item_index=v_reward_item_index and item.category_key='tm'
        and v_profile.badges<case coalesce((item.rules->>'tier')::integer,3)
          when 0 then 7 when 1 then 6 when 2 then 4 else 0 end) then
      raise exception 'Questa MT non Ã¨ ancora acquistabile' using errcode='22023'; end if;
    select coalesce((select quantity from public.player_inventory_item
      where auth_user_id=v_auth_user_id and item_index=v_reward_item_index for update),0)
    into v_inventory_quantity;
    if v_reward_quantity>2147483647-v_inventory_quantity then
      raise exception 'Limite inventario superato' using errcode='22003'; end if;
    insert into public.player_inventory_item(auth_user_id,catalog_release_id,item_index,quantity,updated_at)
    values(v_auth_user_id,v_state.catalog_release_id,v_reward_item_index,v_reward_quantity::integer,now())
    on conflict(auth_user_id,item_index) do update
      set quantity=player_inventory_item.quantity+excluded.quantity,updated_at=now();
  elsif v_reward_kind='pokemon_choice' then
    if exists(select 1 from public.player_ordinary_progression
      where auth_user_id=v_auth_user_id and status<>'completed') then
      raise exception 'Completa prima la progressione PokÃ©mon in sospeso' using errcode='55000'; end if;
    if v_reward->>'levelMode'='fixed_5' and (v_reward->>'level')::integer=5 then v_level:=5;
    elsif v_reward->>'levelMode'='badge_cap' then
      select (rules->>'level')::integer into v_level from public.catalog_progression_rule
      where catalog_release_id=v_profile.catalog_release_id and rule_family='badge_level_limit'
        and rule_key=least(8,greatest(0,v_profile.badges))::text;
    else raise exception 'Livello PokÃ©mon premio non valido' using errcode='22023'; end if;
    if not exists(select 1 from server_authority_private.mission_pokemon_reward_candidates(
      v_profile.catalog_release_id,v_level,coalesce((v_reward->>'excludeFossils')::boolean,false)) candidate
      where candidate.species_key=v_species_key) then
      raise exception 'Questo PokÃ©mon non Ã¨ disponibile per la missione' using errcode='22023'; end if;
    select gender_key into v_gender from public.catalog_species_gender
    where catalog_release_id=v_profile.catalog_release_id and species_key=v_species_key order by random() limit 1;
    select * into strict v_rule from public.catalog_level_rule
    where catalog_release_id=v_profile.catalog_release_id and level=v_level;
    select * into strict v_rule_60 from public.catalog_level_rule
    where catalog_release_id=v_profile.catalog_release_id and level=60;
    v_base_hp:=coalesce(v_rule.base_hp,v_rule_60.base_hp+greatest(0,v_level-60)*3);
    v_base_power:=coalesce(v_rule.base_power,v_rule_60.base_power+greatest(0,v_level-60)*2);
    v_base_stats:=coalesce(v_rule.base_stats,v_rule_60.base_stats+greatest(0,v_level-60)*2);
    v_max_hp:=v_base_hp-floor(random()*(case when v_level>=35 then 5 when v_level>=15 then 3 else 1 end))::integer;
    select jsonb_agg(jsonb_build_array(move_index,
      v_base_power-floor(random()*(case when v_level>=50 then 5 when v_level>=20 then 4 when v_level>=10 then 3 else 1 end))::integer,
      v_base_stats-floor(random()*(case when v_level>=40 then 3 else 1 end))::integer) order by random_order)
    into v_moves from (
      select candidate.move_index,random() random_order from (
        select distinct move_index from public.catalog_species_level_move
        where catalog_release_id=v_profile.catalog_release_id and species_key=v_species_key and level<=v_level
      ) candidate order by random() limit 4
    ) moves;
    if v_moves is null or jsonb_array_length(v_moves)=0 then
      raise exception 'Il PokÃ©mon non ha mosse selvatiche valide a questo livello' using errcode='22023'; end if;
    v_instance_id:=gen_random_uuid();
    insert into public.player_pokemon_instance(id,auth_user_id,catalog_release_id,species_key,state_version,state,revision)
    values(v_instance_id,v_auth_user_id,v_profile.catalog_release_id,v_species_key,1,
      jsonb_build_object('s',v_species_key,'g',case v_gender when 'male' then 'male' when 'female' then 'female' else null end,
        'l',v_level,'hp',v_max_hp,'m',v_moves,'xp',0),1);
    insert into public.player_box_index_state(auth_user_id,next_box_index)
    select v_auth_user_id,coalesce(max(box_index),-1)::bigint+1 from public.player_pokemon_placement
    where auth_user_id=v_auth_user_id and placement_type='box' on conflict(auth_user_id) do nothing;
    select next_box_index into v_box_index from public.player_box_index_state
    where auth_user_id=v_auth_user_id for update;
    select greatest(v_box_index,coalesce(max(box_index),-1)::bigint+1) into v_box_index
    from public.player_pokemon_placement where auth_user_id=v_auth_user_id and placement_type='box';
    if v_box_index>2147483647 then raise exception 'Il Box ha raggiunto il limite massimo' using errcode='22003'; end if;
    update public.player_box_index_state set next_box_index=v_box_index+1,updated_at=now()
    where auth_user_id=v_auth_user_id;
    insert into public.player_pokemon_placement(pokemon_instance_id,auth_user_id,placement_type,slot_index,box_index)
    values(v_instance_id,v_auth_user_id,'box',null,v_box_index::integer);
    insert into public.player_dex_entry(auth_user_id,catalog_release_id,species_key)
    values(v_auth_user_id,v_profile.catalog_release_id,v_species_key) on conflict do nothing;
    v_reward:=jsonb_build_object('kind','pokemon','speciesKey',v_species_key,'level',v_level,
      'pokemonInstanceId',v_instance_id,'boxIndex',v_box_index);
  else raise exception 'Tipo ricompensa missione non supportato: %',coalesce(v_reward_kind,'<null>'); end if;

  update public.player_mission_state
  set claim_status = 'claimed',
      claim_count = claim_count + 1,
      last_claimed_at = now(),
      updated_at = now()
  where auth_user_id = v_auth_user_id
    and mission_index = p_mission_index;
  perform server_authority_private.sync_player_missions(v_auth_user_id);
  update public.player_state_revision set revision=revision+1,updated_at=now()
  where auth_user_id=v_auth_user_id returning revision into v_revision;
  v_result:=server_authority_private.player_state_projection(v_auth_user_id)||jsonb_build_object(
    'command_id',p_command_id,'command_type','mission_claim','mission_index',p_mission_index,
    'selected_reward_item_index',p_selected_reward_item_index,
    'selected_reward_species_key',p_selected_reward_species_key,'reward',v_reward,
    'pokemon_instance_id',v_instance_id);
  insert into public.player_command_receipt(auth_user_id,command_id,command_type,request_hash,result,resulting_revision)
  values(v_auth_user_id,p_command_id,'mission_claim',v_request_hash,v_result,v_revision);
  v_result:=server_authority_private.player_state_projection(v_auth_user_id)||jsonb_build_object(
    'command_id',p_command_id,'command_type','mission_claim','mission_index',p_mission_index,
    'selected_reward_item_index',p_selected_reward_item_index,
    'selected_reward_species_key',p_selected_reward_species_key,'reward',v_reward,
    'pokemon_instance_id',v_instance_id);
  update public.player_command_receipt set result=v_result
  where auth_user_id=v_auth_user_id and command_id=p_command_id;
  return v_result;
end;
$_$;

CREATE OR REPLACE FUNCTION "public"."execute_pokemon_center_command_before_ordinary_guard"("p_command_id" "uuid", "p_expected_revision" bigint, "p_pokemon_instance_id" "uuid", "p_operation" "text", "p_item_index" integer, "p_replacement_slot" integer DEFAULT NULL::integer, "p_evolution_target_species_key" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'extensions', 'pg_temp'
    AS $_$
declare
  v_auth_user_id uuid := auth.uid();
  v_request jsonb;
  v_request_hash text;
  v_receipt_type text;
  v_receipt_hash text;
  v_receipt_result jsonb;
  v_current_revision bigint;
  v_profile public.player_profile_state%rowtype;
  v_instance public.player_pokemon_instance%rowtype;
  v_placement public.player_pokemon_placement%rowtype;
  v_item public.catalog_item%rowtype;
  v_inventory public.player_inventory_item%rowtype;
  v_level_rule public.catalog_level_rule%rowtype;
  v_old_item_index integer;
  v_move_count integer;
  v_move_power integer;
  v_move_stats integer;
  v_item_value integer;  v_mt_tier integer;
  v_target_species_key text := nullif(btrim(p_evolution_target_species_key), '');
  v_types text[];
  v_moves jsonb;
  v_result jsonb;
begin
  if v_auth_user_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if p_command_id is null or p_pokemon_instance_id is null then
    raise exception 'command id and Pokemon instance id are required' using errcode = '22023';
  end if;
  if p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'expected revision must be non-negative' using errcode = '22023';
  end if;
  if p_operation is null or p_operation not in ('assign_held', 'remove_held', 'use_vitamin', 'teach_tm', 'evolve') then
    raise exception 'Pokemon Center operation is not allowed' using errcode = '22023';
  end if;
  if p_item_index is null or p_item_index <= 0 then
    raise exception 'item index must be positive' using errcode = '22023';
  end if;
  if p_operation not in ('teach_tm', 'use_vitamin') and p_replacement_slot is not null then
    raise exception 'move slot is only allowed for MTs and move vitamins' using errcode = '22023';
  end if;
  if p_operation <> 'evolve' and v_target_species_key is not null then
    raise exception 'evolution target is only allowed for evolution' using errcode = '22023';
  end if;
  if p_operation = 'evolve' and v_target_species_key is null then
    raise exception 'evolution target is required' using errcode = '22023';
  end if;

  v_request := jsonb_build_object(
    'command_type', 'pokemon_center_' || p_operation,
    'expected_revision', p_expected_revision,
    'pokemon_instance_id', p_pokemon_instance_id,
    'item_index', p_item_index,
    'replacement_slot', p_replacement_slot,
    'evolution_target_species_key', v_target_species_key
  );
  v_request_hash := encode(digest(convert_to(v_request::text, 'UTF8'), 'sha256'), 'hex');
  perform pg_advisory_xact_lock(hashtextextended(v_auth_user_id::text || ':' || p_command_id::text, 0));

  select command_type, request_hash, result
  into v_receipt_type, v_receipt_hash, v_receipt_result
  from public.player_command_receipt
  where auth_user_id = v_auth_user_id and command_id = p_command_id;
  if found then
    if v_receipt_type <> ('pokemon_center_' || p_operation) or v_receipt_hash <> v_request_hash then
      raise exception 'command id was already used with a different payload' using errcode = '22023';
    end if;
    return v_receipt_result;
  end if;

  select revision into v_current_revision
  from public.player_state_revision
  where auth_user_id = v_auth_user_id
  for update;
  if not found then
    raise exception 'player state does not exist' using errcode = 'P0002';
  end if;
  if v_current_revision <> p_expected_revision then
    raise exception 'revision conflict: expected %, current %', p_expected_revision, v_current_revision using errcode = '40001';
  end if;

  select * into v_profile
  from public.player_profile_state
  where auth_user_id = v_auth_user_id
  for update;
  if not found then
    raise exception 'player profile does not exist' using errcode = 'P0002';
  end if;

  -- Use the team-wide UUID lock order shared by placement commands because held
  -- item limits depend on every team member.
  perform 1
  from public.player_pokemon_placement placement
  join public.player_pokemon_instance pokemon
    on pokemon.id = placement.pokemon_instance_id and pokemon.auth_user_id = placement.auth_user_id
  where placement.auth_user_id = v_auth_user_id and placement.placement_type = 'team'
  order by placement.pokemon_instance_id
  for update of placement, pokemon;

  select * into v_instance
  from public.player_pokemon_instance
  where id = p_pokemon_instance_id and auth_user_id = v_auth_user_id;
  if not found then
    raise exception 'Pokemon instance is not owned by the current player' using errcode = '22023';
  end if;
  select * into v_placement
  from public.player_pokemon_placement
  where pokemon_instance_id = p_pokemon_instance_id and auth_user_id = v_auth_user_id;
  if not found or v_placement.placement_type <> 'team' then
    raise exception 'Pokemon must be in the current team' using errcode = '22023';
  end if;
  if p_operation <> 'remove_held' and exists (
    select 1 from public.player_pending_resolution
    where auth_user_id = v_auth_user_id and pokemon_instance_id = p_pokemon_instance_id and status = 'pending'
  ) then
    raise exception 'Pokemon has a pending resolution' using errcode = '55000';
  end if;
  if v_instance.catalog_release_id <> v_profile.catalog_release_id
    or v_instance.state ->> 's' is distinct from v_instance.species_key then
    raise exception 'canonical Pokemon catalog identity is inconsistent' using errcode = '22023';
  end if;
  if coalesce(v_instance.state ->> 'l', '') !~ '^[1-9][0-9]*$'
    or coalesce(v_instance.state ->> 'hp', '') !~ '^[1-9][0-9]*$'
    or jsonb_typeof(coalesce(v_instance.state -> 'm', 'null'::jsonb)) <> 'array' then
    raise exception 'canonical Pokemon state is invalid' using errcode = '22023';
  end if;

  select * into v_level_rule
  from public.catalog_level_rule
  where catalog_release_id = v_instance.catalog_release_id
    and level = (v_instance.state ->> 'l')::integer;
  if not found then
    raise exception 'level/stat rule is missing for the Pokemon level' using errcode = 'P0002';
  end if;
  if (v_instance.state ->> 'hp')::integer > (case when v_instance.debug_created then 999 else v_level_rule.max_hp end) then
    raise exception 'canonical Pokemon HP exceeds its catalog cap' using errcode = '22023';
  end if;

  select coalesce(jsonb_agg(move order by ordinality), '[]'::jsonb), count(*)::integer
  into v_moves, v_move_count
  from jsonb_array_elements(v_instance.state -> 'm') with ordinality as moves(move, ordinality)
  where jsonb_typeof(move) = 'array' and jsonb_array_length(move) = 3
    and coalesce(move ->> 0, '') ~ '^[1-9][0-9]*$'
    and coalesce(move ->> 1, '') ~ '^[0-9]+$'
    and coalesce(move ->> 2, '') ~ '^[0-9]+$'
    and (move ->> 1)::integer <= (case when v_instance.debug_created then 999 else v_level_rule.max_power end)
    and (move ->> 2)::integer <= (case when v_instance.debug_created then 999 else v_level_rule.max_stats end)
    and exists (
      select 1 from public.catalog_move catalog_move
      where catalog_move.catalog_release_id = v_instance.catalog_release_id
        and catalog_move.move_index = (move ->> 0)::integer
    );
  if v_move_count <> jsonb_array_length(v_instance.state -> 'm') or v_move_count > 4
    or (select count(distinct (move ->> 0)::integer) from jsonb_array_elements(v_moves) move) <> v_move_count then
    raise exception 'canonical Pokemon moves are invalid' using errcode = '22023';
  end if;

  v_old_item_index := case
    when coalesce(v_instance.state ->> 'i', '') ~ '^[1-9][0-9]*$' then (v_instance.state ->> 'i')::integer
    when not (v_instance.state ? 'i') then 0
    else -1
  end;
  if v_old_item_index < 0 or (v_old_item_index > 0 and not exists (
    select 1 from public.catalog_item
    where catalog_release_id = v_instance.catalog_release_id and item_index = v_old_item_index
  )) then
    raise exception 'canonical held item is invalid' using errcode = '22023';
  end if;

  select * into v_item
  from public.catalog_item
  where catalog_release_id = v_instance.catalog_release_id and item_index = p_item_index;
  if not found then
    raise exception 'item is missing from the Pokemon catalog release' using errcode = 'P0002';
  end if;

  perform 1
  from public.player_inventory_item
  where auth_user_id = v_auth_user_id
  order by item_index
  for update;

  select * into v_inventory
  from public.player_inventory_item
  where auth_user_id = v_auth_user_id and item_index = p_item_index
  for update;
  if p_operation <> 'remove_held' and (not found or v_inventory.catalog_release_id <> v_instance.catalog_release_id or v_inventory.quantity <= 0) then
    raise exception 'item is not available in inventory' using errcode = '22023';
  end if;

  if p_operation = 'assign_held' then
    if v_item.category_key not in ('held_item', 'berry') then
      raise exception 'item cannot be held' using errcode = '22023';
    end if;
    if (v_item.rules ? 'allowedSpeciesKeys' and jsonb_typeof(v_item.rules -> 'allowedSpeciesKeys') <> 'array')
      or (v_item.rules ? 'requiredType' and jsonb_typeof(v_item.rules -> 'requiredType') <> 'string')
      or (v_item.rules ? 'requiredMonoType' and jsonb_typeof(v_item.rules -> 'requiredMonoType') <> 'string') then
      raise exception 'held item compatibility rules are malformed' using errcode = '22023';
    end if;
    select array_agg(type_key order by type_order) into v_types
    from public.catalog_species_type
    where catalog_release_id = v_instance.catalog_release_id and species_key = v_instance.species_key;
    if coalesce(array_length(v_types, 1), 0) = 0
      or (jsonb_typeof(v_item.rules -> 'allowedSpeciesKeys') = 'array'
        and jsonb_array_length(v_item.rules -> 'allowedSpeciesKeys') > 0
        and not (v_item.rules -> 'allowedSpeciesKeys' ? v_instance.species_key))
      or (v_item.rules ? 'requiredType' and not ((v_item.rules ->> 'requiredType') = any(v_types)))
      or (v_item.rules ? 'requiredMonoType' and not (array_length(v_types, 1) = 1 and v_types[1] = v_item.rules ->> 'requiredMonoType')) then
      raise exception 'Pokemon is not compatible with the held item' using errcode = '22023';
    end if;
    if v_old_item_index = p_item_index then
      raise exception 'Pokemon already holds this item' using errcode = '22023';
    end if;
    if (select count(*)
      from public.player_pokemon_placement placement
      join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
      where placement.auth_user_id = v_auth_user_id and placement.placement_type = 'team'
        and pokemon.id <> p_pokemon_instance_id
        and coalesce(pokemon.state ->> 'i', '') ~ '^[1-9][0-9]*$'
        and (pokemon.state ->> 'i')::integer = p_item_index) >= 2 then
      raise exception 'team cannot contain more than two Pokemon holding the same item' using errcode = '22023';
    end if;

    if v_inventory.quantity = 1 then
      delete from public.player_inventory_item where auth_user_id = v_auth_user_id and item_index = p_item_index;
    else
      update public.player_inventory_item set quantity = quantity - 1, updated_at = now()
      where auth_user_id = v_auth_user_id and item_index = p_item_index;
    end if;
    if v_old_item_index > 0 then
      insert into public.player_inventory_item(auth_user_id, catalog_release_id, item_index, quantity, updated_at)
      values (v_auth_user_id, v_instance.catalog_release_id, v_old_item_index, 1, now())
      on conflict (auth_user_id, item_index) do update
        set quantity = player_inventory_item.quantity + 1, updated_at = now();
    end if;
    v_instance.state := jsonb_set(v_instance.state, '{i}', to_jsonb(p_item_index), true);

  elsif p_operation = 'remove_held' then
    if v_old_item_index <> p_item_index then
      raise exception 'item index does not match the held item' using errcode = '22023';
    end if;
    if v_item.category_key not in ('held_item', 'berry') then
      raise exception 'canonical held item category is invalid' using errcode = '22023';
    end if;
    insert into public.player_inventory_item(auth_user_id, catalog_release_id, item_index, quantity, updated_at)
    values (v_auth_user_id, v_instance.catalog_release_id, p_item_index, 1, now())
    on conflict (auth_user_id, item_index) do update
      set quantity = player_inventory_item.quantity + 1, updated_at = now();
    v_instance.state := v_instance.state - 'i';

  elsif p_operation = 'use_vitamin' then
    if v_item.category_key <> 'vitamin'
      or v_item.rules ->> 'effect' is null
      or v_item.rules ->> 'effect' not in ('max_hp', 'move_power')
      or coalesce(v_item.rules ->> 'value', '') !~ '^[1-9][0-9]*$' then
      raise exception 'vitamin catalog rules are unsupported or incomplete' using errcode = '22023';
    end if;
    v_item_value := (v_item.rules ->> 'value')::integer;
    if v_item.rules ->> 'effect' = 'max_hp' then
      if p_replacement_slot is not null or (v_instance.state ->> 'hp')::integer >= (case when v_instance.debug_created then 999 else v_level_rule.max_hp end) then
        raise exception 'vitamin would have no valid effect' using errcode = '22023';
      end if;
      v_instance.state := jsonb_set(v_instance.state, '{hp}',
        to_jsonb(least((v_instance.state ->> 'hp')::integer + v_item_value, (case when v_instance.debug_created then 999 else v_level_rule.max_hp end))), true);
    else
      if p_replacement_slot is null or p_replacement_slot < 0 or p_replacement_slot >= v_move_count then
        raise exception 'valid move slot is required for this vitamin' using errcode = '22023';
      end if;
      v_move_power := (v_moves -> p_replacement_slot ->> 1)::integer;
      v_move_stats := (v_moves -> p_replacement_slot ->> 2)::integer;
      if v_move_power >= (case when v_instance.debug_created then 999 else v_level_rule.max_power end) and v_move_stats >= (case when v_instance.debug_created then 999 else v_level_rule.max_stats end) then
        raise exception 'vitamin would have no effect on the selected move' using errcode = '22023';
      end if;
      v_moves := jsonb_set(v_moves, array[p_replacement_slot::text], jsonb_build_array(
        (v_moves -> p_replacement_slot ->> 0)::integer,
        least(v_move_power + v_item_value, (case when v_instance.debug_created then 999 else v_level_rule.max_power end)),
        least(v_move_stats + v_item_value, (case when v_instance.debug_created then 999 else v_level_rule.max_stats end))
      ), false);
      v_instance.state := jsonb_set(v_instance.state, '{m}', v_moves, true);
    end if;
    if v_inventory.quantity = 1 then
      delete from public.player_inventory_item where auth_user_id = v_auth_user_id and item_index = p_item_index;
    else
      update public.player_inventory_item set quantity = quantity - 1, updated_at = now()
      where auth_user_id = v_auth_user_id and item_index = p_item_index;
    end if;

  elsif p_operation = 'teach_tm' then
    if v_item.category_key <> 'tm' or v_item.move_index is null then
      raise exception 'MT catalog rules are unsupported or incomplete' using errcode = '22023';
    end if;
    if not exists (
      select 1 from public.catalog_species_machine_move
      where catalog_release_id = v_instance.catalog_release_id
        and species_key = v_instance.species_key and move_index = v_item.move_index
    ) or exists (
      select 1 from jsonb_array_elements(v_moves) known where (known ->> 0)::integer = v_item.move_index
    ) then
      raise exception 'Pokemon cannot learn this MT' using errcode = '22023';
    end if;
    select coalesce(max((known ->> 1)::integer), v_level_rule.base_power),
      coalesce(max((known ->> 2)::integer), v_level_rule.base_stats)
    into v_move_power, v_move_stats from jsonb_array_elements(v_moves) known;
    if v_move_power is null or v_move_stats is null then
      raise exception 'base move stats are missing for the Pokemon level' using errcode = 'P0002';
    end if;
    if v_move_count < 4 then
      if p_replacement_slot is not null then
        raise exception 'replacement slot is not allowed while fewer than four moves are known' using errcode = '22023';
      end if;
      v_moves := v_moves || jsonb_build_array(jsonb_build_array(v_item.move_index, v_move_power, v_move_stats));
    else
      if p_replacement_slot is null or p_replacement_slot not between 0 and 3 then
        raise exception 'replacement slot must be between 0 and 3' using errcode = '22023';
      end if;
      v_moves := jsonb_set(v_moves, array[p_replacement_slot::text],
        jsonb_build_array(v_item.move_index, v_move_power, v_move_stats), false);
    end if;
    v_instance.state := jsonb_set(v_instance.state, '{m}', v_moves, true);
    -- MTs are reusable in the current game rules, so quantity is validated but not consumed.

  else
    if not ((v_item.category_key = 'item' and v_item.subcategory_key = 'evolution_stone')
      or v_item.category_key = 'held_item') then
      raise exception 'item category cannot trigger evolution' using errcode = '22023';
    end if;
    if not exists (
      select 1 from public.catalog_species_evolution evolution
      where evolution.catalog_release_id = v_instance.catalog_release_id
        and evolution.species_key = v_instance.species_key
        and evolution.target_species_key = v_target_species_key
        and evolution.trigger_key = 'item'
        and coalesce(evolution.trigger_rules -> 'item' ->> 'itemIndex', '') ~ '^[1-9][0-9]*$'
        and (evolution.trigger_rules -> 'item' ->> 'itemIndex')::integer = p_item_index
    ) then
      raise exception 'selected evolution target is not valid for this Pokemon and item' using errcode = '22023';
    end if;
    if (select count(*)
      from public.player_pokemon_placement placement
      join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
      where placement.auth_user_id = v_auth_user_id and placement.placement_type = 'team'
        and pokemon.id <> p_pokemon_instance_id
        and pokemon.species_key = v_target_species_key) >= 2 then
      raise exception 'resulting team cannot contain more than two Pokemon of the same species' using errcode = '22023';
    end if;
    if v_inventory.quantity = 1 then
      delete from public.player_inventory_item where auth_user_id = v_auth_user_id and item_index = p_item_index;
    else
      update public.player_inventory_item set quantity = quantity - 1, updated_at = now()
      where auth_user_id = v_auth_user_id and item_index = p_item_index;
    end if;
    v_instance.species_key := v_target_species_key;
    v_instance.state := jsonb_set(v_instance.state, '{s}', to_jsonb(v_target_species_key), true);
    insert into public.player_dex_entry(auth_user_id, catalog_release_id, species_key)
    values (v_auth_user_id, v_instance.catalog_release_id, v_target_species_key)
    on conflict do nothing;
  end if;

  update public.player_pokemon_instance set
    species_key = v_instance.species_key,
    state = v_instance.state,
    revision = revision + 1,
    updated_at = now()
  where id = p_pokemon_instance_id and auth_user_id = v_auth_user_id;

  update public.player_state_revision set revision = revision + 1, updated_at = now()
  where auth_user_id = v_auth_user_id returning revision into v_current_revision;

  v_result := server_authority_private.player_state_projection(v_auth_user_id) || jsonb_build_object(
    'command_id', p_command_id,
    'command_type', 'pokemon_center_' || p_operation,
    'pokemon_instance_id', p_pokemon_instance_id,
    'item_index', p_item_index,
    'replacement_slot', p_replacement_slot,
    'evolution_target_species_key', v_target_species_key
  );
  insert into public.player_command_receipt(
    auth_user_id, command_id, command_type, request_hash, result, resulting_revision
  ) values (
    v_auth_user_id, p_command_id, 'pokemon_center_' || p_operation,
    v_request_hash, v_result, v_current_revision
  );
  return v_result;
end;
$_$;

CREATE OR REPLACE FUNCTION "public"."execute_pokemon_center_move_tutor_before_revision_guard"("p_command_id" "uuid", "p_expected_revision" bigint, "p_pokemon_instance_id" "uuid", "p_item_index" integer, "p_move_index" integer, "p_replacement_slot" integer DEFAULT NULL::integer) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'extensions', 'pg_temp'
    AS $_$
declare
  v_user uuid := auth.uid(); v_revision bigint; v_profile public.player_profile_state%rowtype;
  v_instance public.player_pokemon_instance%rowtype; v_item public.catalog_item%rowtype;
  v_inventory public.player_inventory_item%rowtype; v_level public.catalog_level_rule%rowtype;
  v_moves jsonb; v_count integer; v_power integer; v_stats integer; v_request jsonb;
  v_hash text; v_receipt public.player_command_receipt%rowtype; v_result jsonb; v_level_value integer;
begin
  if v_user is null then raise exception 'authentication required' using errcode = '28000'; end if;
  if p_command_id is null or p_pokemon_instance_id is null or p_item_index <= 0 or p_move_index <= 0 or p_expected_revision < 0 then
    raise exception 'invalid move tutor command' using errcode = '22023'; end if;
  v_request := jsonb_build_object('command_type','pokemon_center_move_tutor','expected_revision',p_expected_revision,'pokemon_instance_id',p_pokemon_instance_id,'item_index',p_item_index,'move_index',p_move_index,'replacement_slot',p_replacement_slot);
  v_hash := encode(digest(convert_to(v_request::text,'UTF8'),'sha256'),'hex');
  perform pg_advisory_xact_lock(hashtextextended(v_user::text || ':' || p_command_id::text,0));
  select * into v_receipt from public.player_command_receipt where auth_user_id=v_user and command_id=p_command_id;
  if found then
    if v_receipt.command_type <> 'pokemon_center_move_tutor' or v_receipt.request_hash <> v_hash then raise exception 'command id was already used with a different payload' using errcode='22023'; end if;
    return v_receipt.result;
  end if;
  perform server_authority_private.assert_no_pending_ordinary_progression(v_user,p_command_id);
  if exists (select 1 from public.authoritative_battle where auth_user_id=v_user and status in ('active','needs_player_switch')) then
    raise exception 'Pokemon Center is unavailable during an active battle' using errcode='55000'; end if;
  select revision into v_revision from public.player_state_revision where auth_user_id=v_user for update;
  if not found or v_revision <> p_expected_revision then raise exception 'revision conflict' using errcode='40001'; end if;
  select * into v_profile from public.player_profile_state where auth_user_id=v_user for update;
  if not found then raise exception 'player profile does not exist' using errcode='P0002'; end if;
  perform 1 from public.player_pokemon_placement p join public.player_pokemon_instance i on i.id=p.pokemon_instance_id and i.auth_user_id=p.auth_user_id where p.auth_user_id=v_user and p.placement_type='team' order by p.pokemon_instance_id for update of p,i;
  select * into v_instance from public.player_pokemon_instance where id=p_pokemon_instance_id and auth_user_id=v_user;
  if not found or not exists (select 1 from public.player_pokemon_placement where auth_user_id=v_user and pokemon_instance_id=p_pokemon_instance_id and placement_type='team') then raise exception 'Pokemon must be in the current team' using errcode='22023'; end if;
  if exists (select 1 from public.player_pending_resolution where auth_user_id=v_user and pokemon_instance_id=p_pokemon_instance_id and status='pending') then raise exception 'Pokemon has a pending resolution' using errcode='55000'; end if;
  if v_instance.catalog_release_id <> v_profile.catalog_release_id or coalesce(v_instance.state->>'l','') !~ '^[1-9][0-9]*$' or jsonb_typeof(coalesce(v_instance.state->'m','null'::jsonb)) <> 'array' then raise exception 'canonical Pokemon state is invalid' using errcode='22023'; end if;
  v_level_value := (v_instance.state->>'l')::integer;
  select * into v_level from public.catalog_level_rule where catalog_release_id=v_instance.catalog_release_id and level=v_level_value;
  if not found then raise exception 'level rule is missing' using errcode='P0002'; end if;
  select coalesce(jsonb_agg(move order by ordinality),'[]'::jsonb),count(*)::integer into v_moves,v_count from jsonb_array_elements(v_instance.state->'m') with ordinality moves(move,ordinality);
  if v_count > 4 or exists (select 1 from jsonb_array_elements(v_moves) m where jsonb_typeof(m)<>'array' or jsonb_array_length(m)<>3) then raise exception 'canonical Pokemon moves are invalid' using errcode='22023'; end if;
  select * into v_item from public.catalog_item where catalog_release_id=v_instance.catalog_release_id and item_index=p_item_index;
  if not found or v_item.category_key <> 'item' or v_item.subcategory_key <> 'move_tutor' then raise exception 'item is not a move tutor' using errcode='22023'; end if;
  select * into v_inventory from public.player_inventory_item where auth_user_id=v_user and item_index=p_item_index for update;
  if not found or v_inventory.catalog_release_id <> v_instance.catalog_release_id or v_inventory.quantity <= 0 then raise exception 'item is not available in inventory' using errcode='22023'; end if;
  if exists (select 1 from jsonb_array_elements(v_moves) m where (m->>0)::integer=p_move_index) or not exists (
    select 1 from public.catalog_species_level_move l where l.catalog_release_id=v_instance.catalog_release_id and l.species_key=v_instance.species_key and l.move_index=p_move_index and l.level between 5 and v_level_value
    union all select 1 from public.catalog_species_machine_move mt where mt.catalog_release_id=v_instance.catalog_release_id and mt.species_key=v_instance.species_key and mt.move_index=p_move_index
  ) then raise exception 'Pokemon cannot learn the selected tutor move' using errcode='22023'; end if;
  select coalesce(max((m->>1)::integer),v_level.base_power),coalesce(max((m->>2)::integer),v_level.base_stats) into v_power,v_stats from jsonb_array_elements(v_moves) m;
  if v_count < 4 then
    if p_replacement_slot is not null then raise exception 'replacement slot is not allowed while fewer than four moves are known' using errcode='22023'; end if;
    v_moves := v_moves || jsonb_build_array(jsonb_build_array(p_move_index,v_power,v_stats));
  else
    if p_replacement_slot is null or p_replacement_slot not between 0 and 3 then raise exception 'replacement slot must be between 0 and 3' using errcode='22023'; end if;
    v_moves := jsonb_set(v_moves,array[p_replacement_slot::text],jsonb_build_array(p_move_index,v_power,v_stats),false);
  end if;
  v_instance.state := jsonb_set(v_instance.state,'{m}',v_moves,true);
  update public.player_pokemon_instance set state=v_instance.state,revision=revision+1,updated_at=now() where id=p_pokemon_instance_id and auth_user_id=v_user;
  if v_inventory.quantity=1 then delete from public.player_inventory_item where auth_user_id=v_user and item_index=p_item_index; else update public.player_inventory_item set quantity=quantity-1,updated_at=now() where auth_user_id=v_user and item_index=p_item_index; end if;
  update public.player_state_revision set revision=revision+1,updated_at=now() where auth_user_id=v_user returning revision into v_revision;
  v_result := server_authority_private.player_state_projection(v_user) || jsonb_build_object('command_id',p_command_id,'command_type','pokemon_center_move_tutor','pokemon_instance_id',p_pokemon_instance_id,'item_index',p_item_index,'move_index',p_move_index,'replacement_slot',p_replacement_slot);
  insert into public.player_command_receipt(auth_user_id,command_id,command_type,request_hash,result,resulting_revision) values(v_user,p_command_id,'pokemon_center_move_tutor',v_hash,v_result,v_revision);
  return v_result;
end $_$;

CREATE OR REPLACE FUNCTION "public"."publish_catalog_release"("p_version" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'extensions', 'pg_temp'
    AS $_$
declare
  v_release_id uuid;
  v_status text;
  v_family text;
  v_table text;
  v_expected integer;
  v_actual integer;
  v_manifest_count integer;
  v_distinct integer;
  v_checksum text;
  v_manifest record;
  v_chunk record;
begin
  select id, status into v_release_id, v_status
  from public.catalog_release
  where version = p_version
  for update;

  if v_release_id is null then
    raise exception 'catalog release not found: %', p_version;
  end if;
  if v_status <> 'draft' then
    raise exception 'only draft catalog releases can be published: %', p_version;
  end if;

  foreach v_family in array array[
    'zones', 'moves', 'items', 'species', 'progression', 'shop',
    'combat-rules', 'zone-access', 'missions', 'opponents',
    'admin-battles', 'trainers'
  ] loop
    select count(*) filter (where row_count is not null), sum(row_count)::integer
    into v_manifest_count, v_expected
    from public.catalog_import_batch
    where catalog_release_id = v_release_id and family_key = v_family;

    if v_manifest_count <> 1 or v_expected is null or v_expected <= 0 then
      raise exception 'catalog family must have exactly one nonempty primary manifest: %', v_family;
    end if;

    v_table := case v_family
      when 'zones' then 'catalog_zone'
      when 'moves' then 'catalog_move'
      when 'items' then 'catalog_item'
      when 'species' then 'catalog_species'
      when 'progression' then 'catalog_progression_rule'
      when 'shop' then 'catalog_shop_offer'
      when 'zone-access' then 'catalog_zone_access_requirement'
      when 'missions' then 'catalog_mission'
      when 'opponents' then 'catalog_opponent'
      else null
    end;
    if v_table is not null then
      execute format('select count(*)::integer from public.%I where catalog_release_id = $1', v_table)
        into v_actual using v_release_id;
    elsif v_family = 'combat-rules' then
      select
        (select count(*) from public.catalog_type_effectiveness where catalog_release_id = v_release_id)
        + (select count(*) from public.catalog_level_rule where catalog_release_id = v_release_id)
        + (select count(*) from public.catalog_pve_move_category where catalog_release_id = v_release_id)
      into v_actual;
    elsif v_family = 'admin-battles' then
      select
        (select count(*) from public.catalog_admin_battle_type where catalog_release_id = v_release_id)
        + (select count(*) from public.catalog_admin_battle_item where catalog_release_id = v_release_id)
      into v_actual;
    elsif v_family = 'trainers' then
      select
        (select count(*) from public.catalog_trainer_avatar where catalog_release_id = v_release_id)
        + (select count(*) from public.catalog_trainer_name where catalog_release_id = v_release_id)
      into v_actual;
    end if;
    if v_actual <> v_expected then
      raise exception 'catalog primary row count mismatch for %: expected %, found %', v_family, v_expected, v_actual;
    end if;
  end loop;

  -- Chunk rows are mutable while a release is draft, so recheck completeness at
  -- publication instead of relying only on the import-time manifest trigger.
  for v_chunk in
    select family_key, count(*)::integer loaded, max(chunk_total)::integer total,
      count(distinct chunk_total)::integer total_variants,
      count(distinct source_set_checksum)::integer checksum_variants,
      min(chunk_index)::integer first_chunk, max(chunk_index)::integer last_chunk
    from public.catalog_import_chunk
    where catalog_release_id = v_release_id
    group by family_key
  loop
    if v_chunk.family_key <> 'species'
      or v_chunk.total_variants <> 1 or v_chunk.checksum_variants <> 1
      or v_chunk.loaded <> v_chunk.total or v_chunk.first_chunk <> 1
      or v_chunk.last_chunk <> v_chunk.total then
      raise exception 'catalog family chunk import is incomplete or unsupported: %', v_chunk.family_key;
    end if;
  end loop;

  -- Each generated entity manifest key is allowlisted to its owning family and
  -- must occur exactly once with a count equal to the release-scoped table.
  for v_family, v_table in
    select * from (values
      ('zones','catalog_type'), ('zones','catalog_zone'), ('zones','catalog_zone_type'),
      ('zones','catalog_rarity_rule'), ('zones','catalog_capture_hp_threshold'),
      ('moves','catalog_move'), ('items','catalog_item'),
      ('species','catalog_species'), ('species','catalog_species_type'),
      ('species','catalog_species_gender'), ('species','catalog_species_level_move'),
      ('species','catalog_species_machine_move'), ('species','catalog_species_evolution'),
      ('progression','catalog_progression_rule'), ('progression','catalog_daycare_rule'),
      ('progression','catalog_training_reward_rule'), ('shop','catalog_shop_offer'),
      ('battle-shop','catalog_battle_shop_offer'),
      ('combat-rules','catalog_type_effectiveness'), ('combat-rules','catalog_level_rule'),
      ('combat-rules','catalog_pve_move_category'),
      ('zone-access','catalog_zone_access_requirement'), ('missions','catalog_mission'),
      ('opponents','catalog_opponent'), ('opponents','catalog_opponent_pokemon'),
      ('opponents','catalog_opponent_move'), ('opponents','catalog_opponent_reward'),
      ('admin-battles','catalog_admin_battle_type'), ('admin-battles','catalog_admin_battle_item'),
      ('trainers','catalog_trainer_avatar'), ('trainers','catalog_trainer_name')
    ) expected(family_key, table_name)
  loop
    select count(*) filter (where entity_counts ? v_table),
      sum(case when entity_counts ? v_table then (entity_counts ->> v_table)::integer else 0 end)::integer
    into v_manifest_count, v_expected
    from public.catalog_import_batch
    where catalog_release_id = v_release_id and family_key = v_family;
    if v_manifest_count <> 1 or v_expected is null or v_expected < 0 then
      raise exception 'catalog entity manifest is missing or duplicated: %.%', v_family, v_table;
    end if;
    execute format('select count(*)::integer from public.%I where catalog_release_id = $1', v_table)
      into v_actual using v_release_id;
    if v_actual <> v_expected then
      raise exception 'catalog relational row count mismatch for %: expected %, found %', v_table, v_expected, v_actual;
    end if;
  end loop;

  for v_manifest in
    select batch.family_key, entry.key table_name
    from public.catalog_import_batch batch
    cross join lateral jsonb_each(batch.entity_counts) entry
    where batch.catalog_release_id = v_release_id
  loop
    if not exists (
      select 1 from (values
        ('zones','catalog_type'), ('zones','catalog_zone'), ('zones','catalog_zone_type'),
        ('zones','catalog_rarity_rule'), ('zones','catalog_capture_hp_threshold'),
        ('moves','catalog_move'), ('items','catalog_item'),
        ('species','catalog_species'), ('species','catalog_species_type'),
        ('species','catalog_species_gender'), ('species','catalog_species_level_move'),
        ('species','catalog_species_machine_move'), ('species','catalog_species_evolution'),
        ('progression','catalog_progression_rule'), ('progression','catalog_daycare_rule'),
        ('progression','catalog_training_reward_rule'), ('shop','catalog_shop_offer'),
        ('battle-shop','catalog_battle_shop_offer'),
        ('combat-rules','catalog_type_effectiveness'), ('combat-rules','catalog_level_rule'),
        ('combat-rules','catalog_pve_move_category'),
        ('zone-access','catalog_zone_access_requirement'), ('missions','catalog_mission'),
        ('opponents','catalog_opponent'), ('opponents','catalog_opponent_pokemon'),
        ('opponents','catalog_opponent_move'), ('opponents','catalog_opponent_reward'),
        ('admin-battles','catalog_admin_battle_type'), ('admin-battles','catalog_admin_battle_item'),
        ('trainers','catalog_trainer_avatar'), ('trainers','catalog_trainer_name')
      ) expected(family_key, table_name)
      where expected.family_key = v_manifest.family_key
        and expected.table_name = v_manifest.table_name
    ) then
      raise exception 'unsupported catalog manifest entity: %.%', v_manifest.family_key, v_manifest.table_name;
    end if;
  end loop;

  if exists (
    select 1 from public.catalog_move
    where catalog_release_id = v_release_id
      and (rules_key = '' or not (rules ? 'effectKeys'))
  ) then
    raise exception 'catalog moves contain incomplete rule identities';
  end if;

  select count(*), min(level), max(level), count(distinct level)
  into v_actual, v_expected, v_manifest_count, v_distinct
  from public.catalog_level_rule where catalog_release_id = v_release_id;
  if v_actual <> 96 or v_expected <> 5 or v_manifest_count <> 100 or v_distinct <> 96 then
    raise exception 'catalog level rules must contain every level from 5 through 100';
  end if;

  if exists (
    select 1 from (values
      ('gym_pewter_city','gym',0), ('gym_cerulean_city','gym',1),
      ('gym_vermilion_city','gym',2), ('gym_celadon_city','gym',3),
      ('gym_saffron_city','gym',4), ('gym_fuchsia_city','gym',5),
      ('gym_cinnabar_island','gym',6), ('gym_viridian_city','gym',7),
      ('kanto_league_1','league',null), ('kanto_league_2','league',null),
      ('kanto_league_3','league',null), ('kanto_league_4','league',null),
      ('kanto_league_champion','champion',null)
    ) required(opponent_key, opponent_kind, badge_index)
    left join public.catalog_opponent opponent
      on opponent.catalog_release_id = v_release_id and opponent.opponent_key = required.opponent_key
    where opponent.opponent_key is null
      or opponent.opponent_kind <> required.opponent_kind
      or opponent.badge_index is distinct from required.badge_index
  ) then
    raise exception 'required Kanto gym or League opponents are missing or invalid';
  end if;

  if exists (
    select 1 from public.catalog_opponent opponent
    where opponent.catalog_release_id = v_release_id
      and (opponent.opponent_kind in ('gym','league','champion'))
      and not exists (select 1 from public.catalog_opponent_pokemon pokemon
        where pokemon.catalog_release_id = opponent.catalog_release_id and pokemon.opponent_key = opponent.opponent_key)
  ) or exists (
    select 1 from public.catalog_opponent_pokemon pokemon
    join public.catalog_opponent opponent on opponent.catalog_release_id = pokemon.catalog_release_id
      and opponent.opponent_key = pokemon.opponent_key
    where pokemon.catalog_release_id = v_release_id
      and opponent.opponent_kind in ('gym','league','champion')
      and not exists (select 1 from public.catalog_opponent_move move
        where move.catalog_release_id = pokemon.catalog_release_id and move.opponent_key = pokemon.opponent_key
          and move.pokemon_slot_index = pokemon.slot_index)
  ) or exists (
    select 1 from public.catalog_opponent opponent
    where opponent.catalog_release_id = v_release_id and opponent.opponent_kind = 'gym'
      and (not exists (select 1 from public.catalog_opponent_reward reward
        where reward.catalog_release_id = opponent.catalog_release_id and reward.opponent_key = opponent.opponent_key
          and reward.reward_kind = 'money' and reward.quantity > 0)
        or not exists (select 1 from public.catalog_opponent_reward reward
          where reward.catalog_release_id = opponent.catalog_release_id and reward.opponent_key = opponent.opponent_key
            and reward.reward_kind = 'badge' and reward.quantity = 1))
  ) or exists (
    select 1 from public.catalog_opponent opponent
    where opponent.catalog_release_id = v_release_id and opponent.opponent_kind in ('league','champion')
      and (select count(*) from public.catalog_opponent_reward reward
        where reward.catalog_release_id = opponent.catalog_release_id and reward.opponent_key = opponent.opponent_key
          and reward.reward_kind = 'money' and reward.quantity > 0) <> 1
  ) then
    raise exception 'required Kanto opponent rosters, moves or rewards are incomplete';
  end if;

  if exists (
    select 1 from (values
      ('gym_pewter_city',false,false,false), ('gym_cerulean_city',false,false,false),
      ('gym_vermilion_city',false,false,false), ('gym_celadon_city',false,false,false),
      ('gym_saffron_city',false,false,false), ('gym_fuchsia_city',false,false,false),
      ('gym_cinnabar_island',true,true,false), ('gym_viridian_city',true,true,false),
      ('training_debug',true,false,false),
      ('kanto_league_1',true,true,true), ('kanto_league_2',true,true,true),
      ('kanto_league_3',true,true,true), ('kanto_league_4',true,true,true),
      ('kanto_league_champion',true,true,true)
    ) required(battle_type, admin_controlled, reward_enabled, league_battle)
    left join public.catalog_admin_battle_type policy
      on policy.catalog_release_id = v_release_id and policy.battle_type = required.battle_type
    where policy.battle_type is null
      or policy.admin_controlled <> required.admin_controlled
      or policy.reward_enabled <> required.reward_enabled
      or policy.league_battle <> required.league_battle
  ) then
    raise exception 'required authoritative admin battle policies are missing or invalid';
  end if;
  if not exists (select 1 from public.catalog_admin_battle_item where catalog_release_id = v_release_id) then
    raise exception 'authoritative admin battle inventory is empty';
  end if;

  if not exists (select 1 from public.catalog_trainer_avatar where catalog_release_id = v_release_id)
    or exists (select 1 from public.catalog_trainer_avatar where catalog_release_id = v_release_id
      and (gender_key not in ('m','f') or false))
    or exists (select 1 from (values ('m'),('f')) required(gender_key) where not exists (
      select 1 from public.catalog_trainer_name name
      where name.catalog_release_id = v_release_id and name.gender_key = required.gender_key
    )) then
    raise exception 'required trainer avatar and name rows are missing or invalid';
  end if;

  if exists (select 1 from (values (1),(2)) required(sequence) where not exists (
    select 1 from public.catalog_mission mission
    where mission.catalog_release_id = v_release_id and mission.category_key = 'adventure'
      and mission.phase = 8 and mission.sequence = required.sequence
  )) then
    raise exception 'adventure mission phase 8 is incomplete';
  end if;

  if not exists (select 1 from public.catalog_rarity_rule where catalog_release_id = v_release_id)
    or not exists (select 1 from public.catalog_capture_hp_threshold where catalog_release_id = v_release_id)
    or not exists (select 1 from public.catalog_progression_rule where catalog_release_id = v_release_id and rule_family = 'capture_level_limit')
    or not exists (select 1 from public.catalog_progression_rule where catalog_release_id = v_release_id and rule_family = 'capture_level_range')
    or not exists (select 1 from public.catalog_progression_rule where catalog_release_id = v_release_id and rule_family = 'badge_level_limit') then
    raise exception 'capture or progression rules are incomplete';
  end if;

  if (select count(*) from public.catalog_daycare_rule where catalog_release_id = v_release_id) <> 1
    or exists (
      select 1 from public.catalog_daycare_rule daycare
      where daycare.catalog_release_id = v_release_id and (
        daycare.level_interval_seconds is distinct from (select (rules ->> 'value')::integer from public.catalog_progression_rule where catalog_release_id = v_release_id and rule_family = 'constant' and rule_key = 'daycare_level_interval_seconds')
        or daycare.withdraw_base_cost is distinct from (select (rules ->> 'value')::integer from public.catalog_progression_rule where catalog_release_id = v_release_id and rule_family = 'constant' and rule_key = 'daycare_withdraw_base_cost')
        or daycare.withdraw_level_cost is distinct from (select (rules ->> 'value')::integer from public.catalog_progression_rule where catalog_release_id = v_release_id and rule_family = 'constant' and rule_key = 'daycare_withdraw_level_cost')
        or daycare.max_pending_levels is distinct from (select (rules ->> 'value')::integer from public.catalog_progression_rule where catalog_release_id = v_release_id and rule_family = 'constant' and rule_key = 'daycare_max_pending_levels')
        or daycare.badge_level_limits is distinct from (select array_agg((rules ->> 'level')::integer order by (rules ->> 'badges')::integer) from public.catalog_progression_rule where catalog_release_id = v_release_id and rule_family = 'badge_level_limit')
      )
    ) then
    raise exception 'daycare rules are missing or diverge from canonical progression rules';
  end if;

  if (select count(*) from public.catalog_training_reward_rule where catalog_release_id = v_release_id) <> 27
    or exists (
      select 1 from generate_series(0, 8) badges
      cross join (values ('easy'),('medium'),('hard')) difficulty(key)
      where not exists (select 1 from public.catalog_training_reward_rule reward
        where reward.catalog_release_id = v_release_id and reward.badge_count = badges and reward.difficulty = difficulty.key)
    )
    or exists (
      select 1 from public.catalog_training_reward_rule reward
      left join public.catalog_progression_rule daily on daily.catalog_release_id = reward.catalog_release_id
        and daily.rule_family = 'training_daily_reward' and daily.rule_key = reward.badge_count || '.' || reward.difficulty
      left join public.catalog_progression_rule repeat on repeat.catalog_release_id = reward.catalog_release_id
        and repeat.rule_family = 'training_repeat_reward' and repeat.rule_key = reward.difficulty
      left join public.catalog_progression_rule cap on cap.catalog_release_id = reward.catalog_release_id
        and cap.rule_family = 'badge_level_limit' and cap.rule_key = reward.badge_count::text
      where reward.catalog_release_id = v_release_id and (
        reward.max_levels_per_pokemon <> 3 or daily.rule_key is null or repeat.rule_key is null or cap.rule_key is null
        or reward.daily_levels <> (daily.rules ->> 'levels')::integer
        or reward.daily_money <> (daily.rules ->> 'money')::integer
        or reward.repeat_levels <> (repeat.rules ->> 'levels')::integer
        or reward.repeat_money <> (repeat.rules ->> 'money')::integer
        or reward.level_cap <> (cap.rules ->> 'level')::integer
      )
    ) then
    raise exception 'training rewards must contain the canonical 27-row matrix with a per-Pokemon cap of 3';
  end if;

  select 'sha256:' || encode(digest(convert_to(coalesce(string_agg(entry, E'\n' order by entry), ''), 'UTF8'), 'sha256'), 'hex')
  into v_checksum
  from (
    select 'batch:' || jsonb_build_array(family_key, source_path, source_checksum, row_count, entity_counts)::text entry from public.catalog_import_batch where catalog_release_id = v_release_id
    union all select 'type:' || jsonb_build_array(type_key, display_name, sort_order)::text from public.catalog_type where catalog_release_id = v_release_id
    union all select 'move:' || jsonb_build_array(move_index, move_key, display_name, rules_key, rules)::text from public.catalog_move where catalog_release_id = v_release_id
    union all select 'item:' || jsonb_build_array(item_index, item_key, display_name, category_key, subcategory_key, move_index, rules)::text from public.catalog_item where catalog_release_id = v_release_id
    union all select 'species:' || jsonb_build_array(species_key, dex_number, display_name, experience_reward, sprite_gendered, encounter_rarity_key, encounter_min_level, encounter_max_level, rules)::text from public.catalog_species where catalog_release_id = v_release_id
    union all select 'species_type:' || jsonb_build_array(species_key, type_key, type_order)::text from public.catalog_species_type where catalog_release_id = v_release_id
    union all select 'species_gender:' || jsonb_build_array(species_key, gender_key, gender_order)::text from public.catalog_species_gender where catalog_release_id = v_release_id
    union all select 'species_level_move:' || jsonb_build_array(species_key, level, move_index, move_order)::text from public.catalog_species_level_move where catalog_release_id = v_release_id
    union all select 'species_machine_move:' || jsonb_build_array(species_key, move_index)::text from public.catalog_species_machine_move where catalog_release_id = v_release_id
    union all select 'species_evolution:' || jsonb_build_array(species_key, target_species_key, evolution_order, trigger_key, trigger_rules)::text from public.catalog_species_evolution where catalog_release_id = v_release_id
    union all select 'zone:' || jsonb_build_array(zone_key, display_name, rules)::text from public.catalog_zone where catalog_release_id = v_release_id
    union all select 'zone_type:' || jsonb_build_array(zone_key, type_key, type_order)::text from public.catalog_zone_type where catalog_release_id = v_release_id
    union all select 'rarity:' || jsonb_build_array(rarity_key, encounter_weight, catch_multiplier)::text from public.catalog_rarity_rule where catalog_release_id = v_release_id
    union all select 'capture_hp:' || jsonb_build_array(threshold_order, max_hp_fraction, catch_multiplier)::text from public.catalog_capture_hp_threshold where catalog_release_id = v_release_id
    union all select 'progression:' || jsonb_build_array(rule_family, rule_key, sort_order, rules)::text from public.catalog_progression_rule where catalog_release_id = v_release_id
    union all select 'shop:' || jsonb_build_array(offer_key, item_index, section_key, category_key, price, stock_rules)::text from public.catalog_shop_offer where catalog_release_id = v_release_id
  ) catalog_rows;

  update public.catalog_release
  set checksum = v_checksum, status = 'published', published_at = now()
  where id = v_release_id;
  return v_checksum;
end;
$_$;

CREATE OR REPLACE FUNCTION "public"."resolve_edge_ordinary_progression"("p_auth_user_id" "uuid", "p_command_id" "uuid", "p_expected_revision" bigint, "p_pending_resolution_id" "uuid", "p_choices" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'extensions', 'pg_temp'
    AS $$
declare v_receipt public.player_command_receipt%rowtype; v_resolution public.player_pending_resolution%rowtype;
  v_progression public.player_ordinary_progression%rowtype; v_entry public.player_ordinary_progression_pokemon%rowtype;
  v_instance public.player_pokemon_instance%rowtype; v_request jsonb; v_hash text; v_revision bigint; v_moves jsonb;
  v_offer jsonb; v_choice jsonb; v_i integer; v_count integer; v_slot integer; v_evolution text; v_old_species text; v_result jsonb;
  v_remaining jsonb; v_deferred_evolutions jsonb; v_next_offer jsonb; v_next_resolution uuid; v_rule public.catalog_level_rule%rowtype;
  v_power integer; v_stats integer;
begin
  if coalesce(auth.role(),'')<>'service_role' then raise exception 'service role required' using errcode='42501'; end if;
  if jsonb_typeof(p_choices)<>'object' or p_choices-'moves'-'evolutionTargetSpeciesKey'<>'{}'::jsonb
    or jsonb_typeof(p_choices->'moves')<>'array' or jsonb_typeof(p_choices->'evolutionTargetSpeciesKey') not in ('string','null') then
    raise exception 'ordinary progression choices are invalid' using errcode='22023'; end if;
  v_request:=jsonb_build_object('expected_revision',p_expected_revision,'pending_resolution_id',p_pending_resolution_id,'choices',p_choices);
  v_hash:=encode(digest(convert_to(v_request::text,'UTF8'),'sha256'),'hex');
  perform pg_advisory_xact_lock(hashtextextended(p_auth_user_id::text||':'||p_command_id::text,0));
  select * into v_receipt from public.player_command_receipt where auth_user_id=p_auth_user_id and command_id=p_command_id;
  if found then
    if v_receipt.command_type<>'ordinary_progression_resolve' or v_receipt.request_hash<>v_hash then raise exception 'command id payload conflict' using errcode='22023'; end if;
    return v_receipt.result;
  end if;
  select revision into strict v_revision from public.player_state_revision where auth_user_id=p_auth_user_id for update;
  if v_revision<>p_expected_revision then raise exception 'player revision conflict' using errcode='40001'; end if;
  select * into strict v_resolution from public.player_pending_resolution where id=p_pending_resolution_id and auth_user_id=p_auth_user_id for update;
  if v_resolution.status<>'pending' or v_resolution.options->>'source'<>'ordinary' or v_resolution.expected_revision<>p_expected_revision then
    raise exception 'ordinary progression resolution is stale' using errcode='40001'; end if;
  select * into strict v_progression from public.player_ordinary_progression where id=(v_resolution.options->>'progression_id')::uuid and auth_user_id=p_auth_user_id for update;
  select * into strict v_entry from public.player_ordinary_progression_pokemon where progression_id=v_progression.id
    and pending_resolution_id=p_pending_resolution_id for update;
  if p_pending_resolution_id<>(select pending_resolution_id from public.player_ordinary_progression_pokemon
    where progression_id=v_progression.id and status='awaiting_choice' order by award_order limit 1) then
    raise exception 'ordinary progression choices must be resolved in award order' using errcode='22023'; end if;
  select * into strict v_instance from public.player_pokemon_instance where id=v_resolution.pokemon_instance_id and auth_user_id=p_auth_user_id for update;
  if v_instance.revision<>(v_resolution.options->>'proposal_instance_revision')::bigint then raise exception 'ordinary proposal Pokemon revision is stale' using errcode='40001'; end if;
  v_moves:=v_instance.state->'m'; v_count:=jsonb_array_length(v_resolution.options->'level_moves');
  if jsonb_array_length(p_choices->'moves')<>v_count then raise exception 'every ordinary move offer requires a decision' using errcode='22023'; end if;
  if v_count>0 then for v_i in 0..v_count-1 loop
    v_offer:=v_resolution.options->'level_moves'->v_i; v_choice:=p_choices->'moves'->v_i;
    if jsonb_typeof(v_choice)<>'object' or v_choice-'offerIndex'-'moveIndex'-'replacementSlot'<>'{}'::jsonb
      or (v_choice->>'offerIndex')::integer<>v_i or (v_choice->>'moveIndex')::integer<>(v_offer->>'move_index')::integer
      or jsonb_typeof(v_choice->'replacementSlot') not in ('number','null') then raise exception 'move decision differs from frozen ordinary proposal' using errcode='22023'; end if;
    if exists(select 1 from jsonb_array_elements(v_moves) known where server_authority_private.edge_jsonb_bigint(known->0)=(v_offer->>'move_index')::integer) then continue; end if;
    if jsonb_array_length(v_moves)<4 then
      if jsonb_typeof(v_choice->'replacementSlot')<>'null' then raise exception 'free move slot must be automatic' using errcode='22023'; end if;
      v_moves:=v_moves||jsonb_build_array(jsonb_build_array((v_offer->>'move_index')::integer,(v_offer->>'power')::integer,(v_offer->>'stats')::integer));
    elsif jsonb_typeof(v_choice->'replacementSlot')='number' then
      v_slot:=(v_choice->>'replacementSlot')::integer; if v_slot not between 0 and 3 then raise exception 'replacement slot is invalid' using errcode='22023'; end if;
      v_moves:=jsonb_set(v_moves,array[v_slot::text],jsonb_build_array((v_offer->>'move_index')::integer,(v_offer->>'power')::integer,(v_offer->>'stats')::integer),false);
    end if;
  end loop; end if;
  v_evolution:=case when jsonb_typeof(p_choices->'evolutionTargetSpeciesKey')='string' then p_choices->>'evolutionTargetSpeciesKey' else null end;
  if v_evolution is not null and not exists(select 1 from jsonb_array_elements(v_resolution.options->'evolutions') offered
    where offered->>'target_species_key'=v_evolution) then raise exception 'evolution decision differs from frozen ordinary proposal' using errcode='22023'; end if;
  v_old_species:=v_instance.species_key;
  update public.player_pokemon_instance set species_key=coalesce(v_evolution,species_key),
    state=jsonb_set(jsonb_set(state,'{m}',v_moves,true),'{s}',to_jsonb(coalesce(v_evolution,species_key)),true),revision=revision+1,updated_at=now()
    where id=v_instance.id;
  if v_evolution is not null then insert into public.player_dex_entry(auth_user_id,catalog_release_id,species_key)
    values(p_auth_user_id,v_progression.catalog_release_id,v_evolution) on conflict do nothing;
  elsif jsonb_array_length(v_resolution.options->'evolutions')>0 then
    update public.player_ordinary_progression_pokemon set refused_species=refused_species||to_jsonb(v_old_species)
      where progression_id=v_progression.id and pokemon_instance_id=v_instance.id;
  end if;
  update public.player_pending_resolution set status='resolved',resolved_at=now() where id=p_pending_resolution_id;
  v_remaining:=coalesce(v_resolution.options->'remaining_level_moves','[]'::jsonb);
  v_deferred_evolutions:=coalesce(v_resolution.options->'deferred_evolutions','[]'::jsonb);
  if v_evolution is not null and jsonb_array_length(v_remaining)=0 then
    select coalesce(jsonb_agg(jsonb_build_object('level',learned.level,'move_index',learned.move_index,
      'move_order',learned.move_order,'name',move.display_name) order by learned.move_order),'[]'::jsonb) into v_remaining
    from public.catalog_species_level_move learned join public.catalog_move move
      on move.catalog_release_id=learned.catalog_release_id and move.move_index=learned.move_index
    where learned.catalog_release_id=v_progression.catalog_release_id and learned.species_key=v_evolution
      and learned.level=(v_resolution.options->>'level')::integer
      and not exists(select 1 from jsonb_array_elements(v_moves) known
        where server_authority_private.edge_jsonb_bigint(known->0)=learned.move_index);
    v_deferred_evolutions:='[]'::jsonb;
  end if;
  if jsonb_array_length(v_remaining)>0 then
    v_next_offer:=v_remaining->0;
    select * into strict v_rule from public.catalog_level_rule where catalog_release_id=v_progression.catalog_release_id
      and level=(v_resolution.options->>'level')::integer;
    select coalesce(max(server_authority_private.edge_jsonb_bigint(move->1)),v_rule.base_power),
      coalesce(max(server_authority_private.edge_jsonb_bigint(move->2)),v_rule.base_stats) into v_power,v_stats
      from jsonb_array_elements(v_moves) move;
    v_next_offer:=v_next_offer||jsonb_build_object(
      'power',least(v_power+2+mod(get_byte(digest(convert_to(v_progression.id::text||':'||v_instance.id::text||':'
        ||(v_next_offer->>'move_index')||':power','UTF8'),'sha256'),0),2),v_rule.max_power),
      'stats',least(v_stats+2+mod(get_byte(digest(convert_to(v_progression.id::text||':'||v_instance.id::text||':'
        ||(v_next_offer->>'move_index')||':stats','UTF8'),'sha256'),0),2),v_rule.max_stats));
    insert into public.player_pending_resolution(auth_user_id,pokemon_instance_id,resolution_type,options,expected_revision)
    values(p_auth_user_id,v_instance.id,case when jsonb_array_length(v_remaining)=1
        and jsonb_array_length(v_deferred_evolutions)>0 then 'evolution' else 'move' end,
      jsonb_build_object('source','ordinary','progression_id',v_progression.id,'team_slot',v_entry.team_slot,
        'level',v_resolution.options->'level','before_state',null,'after_state',null,
        'proposal_instance_revision',v_instance.revision+1,'level_moves',jsonb_build_array(v_next_offer),
        'remaining_level_moves',v_remaining-0,
        'evolutions',case when jsonb_array_length(v_remaining)=1 then v_deferred_evolutions else '[]'::jsonb end,
        'deferred_evolutions',v_deferred_evolutions),p_expected_revision+1)
    returning id into v_next_resolution;
    update public.player_ordinary_progression_pokemon set status='awaiting_choice',pending_resolution_id=v_next_resolution,
      frozen_instance_revision=v_instance.revision+1 where progression_id=v_progression.id and pokemon_instance_id=v_instance.id;
  else
    update public.player_ordinary_progression_pokemon set status='pending',pending_resolution_id=null,frozen_instance_revision=v_instance.revision+1
      where progression_id=v_progression.id and pokemon_instance_id=v_instance.id;
    perform server_authority_private.advance_ordinary_progression(p_auth_user_id,v_progression.id,p_expected_revision+1);
  end if;
  update public.player_state_revision set revision=revision+1,updated_at=now() where auth_user_id=p_auth_user_id returning revision into v_revision;
  v_result:=server_authority_private.player_state_projection(p_auth_user_id)||jsonb_build_object('command_id',p_command_id,
    'command_type','ordinary_progression_resolve','progression_id',v_progression.id,'pokemon_instance_id',v_instance.id,
    'evolved_from_species_key',case when v_evolution is null then null else v_old_species end,'evolved_to_species_key',v_evolution);
  insert into public.player_command_receipt(auth_user_id,command_id,command_type,request_hash,result,resulting_revision)
    values(p_auth_user_id,p_command_id,'ordinary_progression_resolve',v_hash,v_result,v_revision);
  perform server_authority_private.emit_ordinary_level_events(p_auth_user_id,v_progression.id,p_command_id);
  if v_evolution is not null then perform server_authority_private.apply_mission_fact(
    p_auth_user_id,'pokemon_evolved',jsonb_build_object('speciesKey',v_old_species,'targetSpeciesKey',v_evolution,'source','ordinary'),
    (select receipt.created_at from public.player_command_receipt receipt where auth_user_id=p_auth_user_id and command_id=p_command_id)); end if;
  v_result:=server_authority_private.player_state_projection(p_auth_user_id)||jsonb_build_object('command_id',p_command_id,
    'command_type','ordinary_progression_resolve','progression_id',v_progression.id,'pokemon_instance_id',v_instance.id,
    'evolved_from_species_key',case when v_evolution is null then null else v_old_species end,'evolved_to_species_key',v_evolution);
  update public.player_command_receipt set result=v_result where auth_user_id=p_auth_user_id and command_id=p_command_id;
  return v_result;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."start_authoritative_battle"("p_command_id" "uuid", "p_expected_player_revision" bigint, "p_contract_key" "text", "p_runtime_owner_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'extensions', 'pg_temp'
    AS $_$
declare
  v_auth_user_id uuid := auth.uid();
  v_request jsonb;
  v_hash text;
  v_receipt public.player_command_receipt%rowtype;
  v_player_revision bigint;
  v_catalog_release_id uuid;
  v_battle_id uuid := gen_random_uuid();
  v_entropy text := encode(gen_random_bytes(16), 'hex');
  v_actor_draw integer := get_byte(gen_random_bytes(1), 0);
  v_first_actor text;
  v_lead record;
  v_team record;
  v_types jsonb;
  v_moves jsonb;
  v_move jsonb;
  v_action_rule public.catalog_move%rowtype;
  v_level_rule public.catalog_level_rule%rowtype;
  v_result jsonb;
begin
  if v_auth_user_id is null then raise exception 'authentication required' using errcode = '28000'; end if;
  if p_command_id is null or p_runtime_owner_id is null then
    raise exception 'command id and runtime owner id are required' using errcode = '22023';
  end if;
  if p_expected_player_revision is null or p_expected_player_revision < 0 then
    raise exception 'expected player revision must be non-negative' using errcode = '22023';
  end if;
  if p_contract_key <> 'tackle_test' then
    raise exception 'authoritative battle contract is unsupported' using errcode = '0A000';
  end if;
  v_request := jsonb_build_object('command_type', 'authoritative_battle_start',
    'expected_player_revision', p_expected_player_revision, 'contract_key', p_contract_key,
    'runtime_owner_id', p_runtime_owner_id);
  v_hash := encode(digest(convert_to(v_request::text, 'UTF8'), 'sha256'), 'hex');
  perform pg_advisory_xact_lock(hashtextextended(v_auth_user_id::text || ':' || p_command_id::text, 0));
  select * into v_receipt from public.player_command_receipt
  where auth_user_id = v_auth_user_id and command_id = p_command_id;
  if found then
    if v_receipt.command_type <> 'authoritative_battle_start' or v_receipt.request_hash <> v_hash then
      raise exception 'command id was already used with a different payload' using errcode = '22023';
    end if;
    return v_receipt.result;
  end if;

  select revision into v_player_revision from public.player_state_revision
  where auth_user_id = v_auth_user_id for update;
  if not found then raise exception 'player state does not exist' using errcode = 'P0002'; end if;
  if v_player_revision <> p_expected_player_revision then
    raise exception 'player revision conflict: expected %, current %', p_expected_player_revision, v_player_revision using errcode = '40001';
  end if;
  if exists (select 1 from public.authoritative_battle where auth_user_id = v_auth_user_id
    and status in ('active', 'needs_player_switch')) then
    raise exception 'an authoritative battle is already active' using errcode = '23505';
  end if;

  select profile.catalog_release_id into v_catalog_release_id from public.player_profile_state profile
  where profile.auth_user_id = v_auth_user_id;
  if v_catalog_release_id is null then raise exception 'player catalog release is missing' using errcode = 'P0002'; end if;
  select * into v_action_rule from public.catalog_move
  where catalog_release_id = v_catalog_release_id and move_index = 25
    and move_key = 'tackle';
  if not found or jsonb_typeof(v_action_rule.rules -> 'effectKeys') <> 'object'
    or v_action_rule.rules -> 'effectKeys' <> jsonb_build_object(
      'before', 'move.tackle.before',
      'after', 'move.tackle.after'
    ) then
    raise exception 'catalog Azione effects are unsupported by authoritative battle v1' using errcode = '0A000';
  end if;

  -- Lock the canonical instances in stable UUID order and validate the entire
  -- team before creating any battle aggregate or event.
  perform 1 from public.player_pokemon_placement placement
  join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
  where placement.auth_user_id = v_auth_user_id and placement.placement_type = 'team'
  order by pokemon.id for update of pokemon, placement;
  if not found then raise exception 'a non-empty canonical team is required' using errcode = '22023'; end if;

  for v_team in
    select placement.slot_index, pokemon.* from public.player_pokemon_placement placement
    join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
    where placement.auth_user_id = v_auth_user_id and placement.placement_type = 'team'
    order by placement.slot_index
  loop
    select * into v_level_rule from public.catalog_level_rule
    where catalog_release_id = v_catalog_release_id and level = (v_team.state ->> 'l')::integer;
    if v_team.catalog_release_id <> v_catalog_release_id or v_team.state_version <> 1
      or coalesce(v_team.state ->> 's', '') <> v_team.species_key
      or coalesce(v_team.state ->> 'l', '') !~ '^[1-9][0-9]*$'
      or (v_team.state ->> 'l')::integer not between 1 and 100
      or coalesce(v_team.state ->> 'hp', '') !~ '^[1-9][0-9]*$'
      or jsonb_typeof(v_team.state -> 'm') <> 'array'
      or jsonb_array_length(v_team.state -> 'm') not between 1 and 4
      or coalesce((v_team.state ->> 'i')::integer, 0) <> 0
      or not found
      or (v_team.state ->> 'hp')::integer > v_level_rule.max_hp then
      raise exception 'canonical team Pokemon is unsupported by tackle_test' using errcode = '0A000';
    end if;
    for v_move in select value from jsonb_array_elements(v_team.state -> 'm') loop
      if jsonb_typeof(v_move) <> 'array' or jsonb_array_length(v_move) <> 3
        or coalesce(v_move ->> 0, '') <> '25'
        or coalesce(v_move ->> 1, '') !~ '^[1-9][0-9]*$'
        or coalesce(v_move ->> 2, '') !~ '^[0-9]+$'
        or (v_move ->> 1)::integer > v_level_rule.max_power
        or (v_move ->> 2)::integer > v_level_rule.max_stats then
        raise exception 'unsupported move in canonical team; tackle_test accepts only Azione' using errcode = '0A000';
      end if;
    end loop;
  end loop;

  select placement.slot_index, pokemon.* into v_lead
  from public.player_pokemon_placement placement
  join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
  where placement.auth_user_id = v_auth_user_id and placement.placement_type = 'team'
  order by placement.slot_index limit 1;
  select * into v_level_rule from public.catalog_level_rule
  where catalog_release_id = v_catalog_release_id and level = (v_lead.state ->> 'l')::integer;
  if not found or v_level_rule.base_power is null then
    raise exception 'catalog level rule cannot construct tackle_test opponent' using errcode = '0A000';
  end if;
  v_first_actor := case when v_actor_draw < 128 then 'player' else 'npc' end;

  insert into public.authoritative_battle (
    id, auth_user_id, catalog_release_id, contract_key, status, first_actor,
    player_active_slot, runtime_owner_id, rng_state
  ) values (
    v_battle_id, v_auth_user_id, v_catalog_release_id, p_contract_key, 'active', v_first_actor,
    v_lead.slot_index, p_runtime_owner_id,
    jsonb_build_object('algorithm', 'pgcrypto_independent_bytes', 'entropy_hex', v_entropy,
      'draws', jsonb_build_array(jsonb_build_object('purpose', 'first_actor', 'byte', v_actor_draw)))
  );

  for v_team in
    select placement.slot_index, pokemon.* from public.player_pokemon_placement placement
    join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
    where placement.auth_user_id = v_auth_user_id and placement.placement_type = 'team'
    order by placement.slot_index
  loop
    select jsonb_agg(to_jsonb(types.type_key) order by types.type_order) into v_types
    from public.catalog_species_type types where types.catalog_release_id = v_catalog_release_id
      and types.species_key = v_team.species_key;
    if coalesce(jsonb_array_length(v_types), 0) not between 1 and 2 then
      raise exception 'catalog species types are incomplete' using errcode = '0A000';
    end if;
    select jsonb_agg(jsonb_build_object('move_index', 25, 'display_name', 'tackle',
      'power', (move ->> 1)::integer, 'stats', (move ->> 2)::integer,
      'rules_contract', 'simple_damage') order by ordinality) into v_moves
    from jsonb_array_elements(v_team.state -> 'm') with ordinality moves(move, ordinality);
    insert into public.authoritative_battle_participant (
      battle_id, side, slot_index, pokemon_instance_id, species_key, display_name,
      level, max_hp, current_hp, type_keys, moves, source_snapshot
    ) select v_battle_id, 'player', v_team.slot_index, v_team.id, v_team.species_key,
      species.display_name, (v_team.state ->> 'l')::integer, (v_team.state ->> 'hp')::integer,
      (v_team.state ->> 'hp')::integer, v_types, v_moves,
      v_team.state || jsonb_build_object('instance_id', v_team.id, 'instance_revision', v_team.revision)
    from public.catalog_species species where species.catalog_release_id = v_catalog_release_id
      and species.species_key = v_team.species_key;
    if not found then raise exception 'catalog species is missing for canonical team' using errcode = 'P0002'; end if;
  end loop;

  select jsonb_agg(to_jsonb(types.type_key) order by types.type_order) into v_types
  from public.catalog_species_type types where types.catalog_release_id = v_catalog_release_id
    and types.species_key = v_lead.species_key;
  v_moves := jsonb_build_array(jsonb_build_object('move_index', 25, 'display_name', 'tackle',
    'power', v_level_rule.base_power, 'stats', coalesce(v_level_rule.base_stats, 0),
    'rules_contract', 'simple_damage'));
  insert into public.authoritative_battle_participant (
    battle_id, side, slot_index, pokemon_instance_id, species_key, display_name,
    level, max_hp, current_hp, type_keys, moves, source_snapshot
  ) select v_battle_id, 'npc', 0, null, species.species_key, species.display_name,
    (v_lead.state ->> 'l')::integer, v_level_rule.max_hp, v_level_rule.max_hp,
    v_types, v_moves, jsonb_build_object('source', 'tackle_test',
      'species_key', species.species_key, 'level_rule', (v_lead.state ->> 'l')::integer)
  from public.catalog_species species where species.catalog_release_id = v_catalog_release_id
    and species.species_key = v_lead.species_key;

  perform server_authority_private.authoritative_battle_append_event(v_battle_id, 'battle_started',
    jsonb_build_object('contract_key', p_contract_key, 'first_actor', v_first_actor,
      'reward_status', 'disabled_first_slice', 'supported_move_indexes', jsonb_build_array(25)),
    p_command_id,
    jsonb_build_array(jsonb_build_object('purpose', 'first_actor', 'byte', v_actor_draw,
      'result', v_first_actor)));
  update public.player_state_revision set revision = revision + 1, updated_at = now()
  where auth_user_id = v_auth_user_id returning revision into v_player_revision;
  v_result := jsonb_build_object('player_revision', v_player_revision,
    'battle', server_authority_private.authoritative_battle_projection(v_auth_user_id, v_battle_id));
  insert into public.player_command_receipt(auth_user_id, command_id, command_type, request_hash,
    result, resulting_revision) values (v_auth_user_id, p_command_id, 'authoritative_battle_start',
      v_hash, v_result, v_player_revision);
  return v_result;
end;
$_$;

CREATE OR REPLACE FUNCTION "public"."start_edge_admin_gym_battle_before_ordinary_guard"("p_auth_user_id" "uuid", "p_command_id" "uuid", "p_expected_player_revision" bigint, "p_runtime_owner_id" "uuid", "p_gym_key" "text", "p_active_slot" integer, "p_engine_version" "text", "p_engine_checksum" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'extensions', 'pg_temp'
    AS $_$
declare
  v_request jsonb;
  v_hash text;
  v_receipt public.player_command_receipt%rowtype;
  v_revision bigint;
  v_catalog uuid;
  v_battle_id uuid := gen_random_uuid();
  v_entropy text := encode(gen_random_bytes(16), 'hex');
  v_actor_draw integer := get_byte(gen_random_bytes(1), 0);
  v_first_actor text;
  v_profile public.player_profile_state%rowtype;
  v_opponent public.catalog_opponent%rowtype;
  v_opponent_key text;
  v_team record;
  v_npc record;
  v_move jsonb;
  v_level public.catalog_level_rule%rowtype;
  v_types jsonb;
  v_moves jsonb;
  v_result jsonb;
  v_limit integer;
  v_count integer;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if p_auth_user_id is null or p_command_id is null or p_runtime_owner_id is null then
    raise exception 'gym start identity is required' using errcode = '22023';
  end if;
  if p_expected_player_revision is null or p_expected_player_revision < 0
    or p_active_slot not between 0 and 5
    or p_gym_key is null or p_gym_key !~ '^[a-z0-9_]{1,40}$' or p_gym_key not in ('cinnabar_island', 'viridian_city')
    or p_engine_version is null or length(p_engine_version) not between 1 and 80
    or p_engine_checksum is null or p_engine_checksum !~ '^[0-9a-f]{64}$' then
    raise exception 'gym start envelope is invalid' using errcode = '22023';
  end if;
  v_request := jsonb_build_object(
    'command_type', 'authoritative_admin_gym_start',
    'expected_player_revision', p_expected_player_revision,
    'runtime_owner_id', p_runtime_owner_id,
    'gym_key', p_gym_key,
    'active_slot', p_active_slot,
    'engine_version', p_engine_version,
    'engine_checksum', p_engine_checksum
  );
  v_hash := encode(digest(convert_to(v_request::text, 'UTF8'), 'sha256'), 'hex');
  perform pg_advisory_xact_lock(hashtextextended(p_auth_user_id::text || ':' || p_command_id::text, 0));
  select * into v_receipt from public.player_command_receipt
  where auth_user_id = p_auth_user_id and command_id = p_command_id;
  if found then
    if v_receipt.command_type <> 'authoritative_admin_gym_start' or v_receipt.request_hash <> v_hash then
      raise exception 'command id was already used with a different payload' using errcode = '22023';
    end if;
    return v_receipt.result;
  end if;

  select revision into v_revision from public.player_state_revision
  where auth_user_id = p_auth_user_id for update;
  if not found then raise exception 'player state does not exist' using errcode = 'P0002'; end if;
  if v_revision <> p_expected_player_revision then
    raise exception 'player revision conflict' using errcode = '40001';
  end if;
  if exists (select 1 from public.authoritative_battle where auth_user_id = p_auth_user_id
    and status in ('active', 'needs_player_switch')) then
    raise exception 'an authoritative battle is already active' using errcode = '23505';
  end if;
  if exists (select 1 from public.player_training_progression
    where auth_user_id = p_auth_user_id and status <> 'completed') then
    raise exception 'complete the pending training progression first' using errcode = '55000';
  end if;

  select * into strict v_profile from public.player_profile_state
  where auth_user_id = p_auth_user_id for update;
  v_catalog := v_profile.catalog_release_id;
  if not exists (select 1 from public.catalog_engine_runtime_binding
    where catalog_release_id = v_catalog and enabled
      and engine_version = p_engine_version and engine_checksum = p_engine_checksum) then
    raise exception 'player catalog has no enabled battle engine binding' using errcode = '0A000';
  end if;
  v_opponent_key := 'gym_' || p_gym_key;
  select * into v_opponent from public.catalog_opponent
  where catalog_release_id = v_catalog and opponent_key = v_opponent_key;
  if not found or v_opponent.opponent_kind <> 'gym' or v_opponent.badge_index is null then
    raise exception 'canonical gym does not exist' using errcode = '22023';
  end if;
  if v_opponent.badge_index <> v_profile.badges
    or coalesce((v_opponent.rules ->> 'unlockBadges')::integer, -1) <> v_profile.badges then
    raise exception 'only the exact next gym may be challenged' using errcode = '22023';
  end if;
  if not exists (select 1 from public.catalog_admin_battle_type admin_type
    where admin_type.catalog_release_id = v_catalog
      and admin_type.battle_type = v_opponent_key and admin_type.admin_controlled) then
    raise exception 'gym admin policy is missing or requires the admin-controlled battle contract' using errcode = '0A000';
  end if;
  if not exists (select 1 from public.catalog_opponent_pokemon
      where catalog_release_id = v_catalog and opponent_key = v_opponent_key)
     then
    raise exception 'gym roster is missing' using errcode = '0A000';
  end if;
  if exists (select 1 from public.catalog_opponent_pokemon pokemon
    where pokemon.catalog_release_id = v_catalog and pokemon.opponent_key = v_opponent_key
      and not exists (select 1 from public.catalog_opponent_move move
        where move.catalog_release_id = pokemon.catalog_release_id
          and move.opponent_key = pokemon.opponent_key
          and move.pokemon_slot_index = pokemon.slot_index)) then
    raise exception 'gym roster has a Pokemon without catalog moves' using errcode = '0A000';
  end if;
  perform server_authority_private.sync_player_missions(p_auth_user_id);
  if not exists (select 1 from public.catalog_mission
      where catalog_release_id = v_catalog and category_key = 'adventure'
        and phase = v_opponent.badge_index + 1)
    or exists (
    select 1 from public.catalog_mission mission
    left join public.player_mission_state mission_state
      on mission_state.auth_user_id = p_auth_user_id
      and mission_state.catalog_release_id = mission.catalog_release_id
      and mission_state.mission_index = mission.mission_index
    where mission.catalog_release_id = v_catalog and mission.category_key = 'adventure'
      and mission.phase = v_opponent.badge_index + 1
      and coalesce(mission_state.claim_status, '') not in ('claimed', 'skipped')
  ) then raise exception 'complete the gym adventure phase first' using errcode = '22023'; end if;

  perform 1 from public.player_pokemon_placement placement
  join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
  where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team'
  order by pokemon.id for update of pokemon, placement;
  if not found then raise exception 'a non-empty canonical team is required' using errcode = '22023'; end if;
  if not exists (select 1 from public.player_pokemon_placement
    where auth_user_id = p_auth_user_id and placement_type = 'team' and slot_index = p_active_slot) then
    raise exception 'active team slot does not exist' using errcode = '22023';
  end if;
  if exists (select 1 from public.player_pokemon_placement placement
    join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
    where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team'
    group by pokemon.species_key having count(*) > 2) then
    raise exception 'team contains more than two Pokemon of one species' using errcode = '22023';
  end if;
  if exists (select 1 from public.player_pokemon_placement placement
    join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
    where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team'
      and coalesce(server_authority_private.edge_jsonb_bigint(pokemon.state -> 'i'), 0) > 0
    group by server_authority_private.edge_jsonb_bigint(pokemon.state -> 'i') having count(*) > 2) then
    raise exception 'team contains more than two equal held items' using errcode = '22023';
  end if;

  v_limit := coalesce((v_opponent.rules ->> 'maxPlayerLevel')::integer, -1);
  for v_team in select placement.slot_index, pokemon.*
    from public.player_pokemon_placement placement
    join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
    where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team'
    order by placement.slot_index
  loop
    if v_team.catalog_release_id <> v_catalog or v_team.state_version <> 1
      or jsonb_typeof(v_team.state) is distinct from 'object'
      or v_team.state ->> 's' <> v_team.species_key
      or server_authority_private.edge_jsonb_bigint(v_team.state -> 'l') not between 1 and v_limit
      or jsonb_typeof(v_team.state -> 'm') is distinct from 'array'
      or jsonb_array_length(v_team.state -> 'm') not between 1 and 4 then
      raise exception 'canonical team Pokemon is not eligible for gym' using errcode = '0A000';
    end if;
    select * into v_level from public.catalog_level_rule where catalog_release_id = v_catalog
      and level = server_authority_private.edge_jsonb_bigint(v_team.state -> 'l');
    if not found or coalesce(server_authority_private.edge_jsonb_bigint(v_team.state -> 'hp'), 0) <= 0
      or server_authority_private.edge_jsonb_bigint(v_team.state -> 'hp') > (case when v_team.debug_created then 999 else v_level.max_hp end) then
      raise exception 'canonical Pokemon HP/level is invalid' using errcode = '0A000';
    end if;
    if v_team.state ? 'i' and coalesce(v_team.state ->> 'i', '') !~ '^[1-9][0-9]*$' then
      raise exception 'canonical held item is malformed' using errcode = '0A000';
    end if;
    if v_team.state ? 'i' and not server_authority_private.held_item_is_compatible(
      v_catalog, v_team.species_key, (v_team.state ->> 'i')::integer) then
      raise exception 'held item category or Pokemon compatibility is invalid' using errcode = '0A000';
    end if;
    for v_move in select value from jsonb_array_elements(v_team.state -> 'm') loop
      if jsonb_typeof(v_move) is distinct from 'array' or jsonb_array_length(v_move) <> 3
        or server_authority_private.edge_jsonb_bigint(v_move -> 0) is null
        or coalesce(server_authority_private.edge_jsonb_bigint(v_move -> 1), -1) not between 0 and (case when v_team.debug_created then 999 else v_level.max_power end)
        or coalesce(server_authority_private.edge_jsonb_bigint(v_move -> 2), -1) not between 0 and (case when v_team.debug_created then 999 else v_level.max_stats end)
        or not exists (select 1 from public.catalog_move where catalog_release_id = v_catalog
          and move_index = server_authority_private.edge_jsonb_bigint(v_move -> 0)) then
        raise exception 'canonical Pokemon move is outside catalog/level caps' using errcode = '0A000';
      end if;
    end loop;
  end loop;

  select count(*) into v_count from public.player_pokemon_placement placement
  join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
  where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team'
    and exists (select 1 from jsonb_array_elements(pokemon.state -> 'm') move
      where server_authority_private.edge_jsonb_bigint(move -> 0) in (2, 132, 211, 234));
  if v_count > coalesce((v_opponent.rules ->> 'ohkoPokemonMax')::integer, -1) then
    raise exception 'team exceeds the gym OHKO Pokemon limit' using errcode = '22023';
  end if;
  select count(*) into v_count from public.player_pokemon_placement placement
  join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
  join public.catalog_shop_offer offer on offer.catalog_release_id = v_catalog
    and offer.item_index = server_authority_private.edge_jsonb_bigint(pokemon.state -> 'i')
    and offer.section_key = 'port_market' and offer.category_key = 'port_items'
  where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team';
  if v_count > coalesce((v_opponent.rules ->> 'portItemMax')::integer, -1) then
    raise exception 'team exceeds the gym Port held-item limit' using errcode = '22023';
  end if;
  if jsonb_typeof(v_opponent.rules -> 'superEffectivePokemonMax') = 'number' then
    select count(*) into v_count
    from public.player_pokemon_placement placement
    join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
    where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team'
      and exists (
        select 1 from public.catalog_opponent_pokemon opponent_pokemon
        where opponent_pokemon.catalog_release_id = v_catalog
          and opponent_pokemon.opponent_key = v_opponent_key
          and (select coalesce(exp(sum(ln(effect.multiplier))), 1)
            from public.catalog_species_type attacker_type
            cross join public.catalog_species_type defender_type
            join public.catalog_type_effectiveness effect
              on effect.catalog_release_id = v_catalog
              and effect.attacker_type_key = attacker_type.type_key
              and effect.defender_type_key = defender_type.type_key
            where attacker_type.catalog_release_id = v_catalog
              and attacker_type.species_key = pokemon.species_key
              and defender_type.catalog_release_id = v_catalog
              and defender_type.species_key = opponent_pokemon.species_key) > 1
      );
    if v_count > (v_opponent.rules ->> 'superEffectivePokemonMax')::integer then
      raise exception 'team exceeds the gym super-effective Pokemon limit' using errcode = '22023';
    end if;
  end if;

  v_first_actor := 'player';
  insert into public.authoritative_battle(
    id, auth_user_id, catalog_release_id, contract_key, status, first_actor,
    player_active_slot, npc_active_slot, runtime_owner_id, rng_state,
    engine_runtime_state, requested_engine_version, requested_engine_checksum,
    gym_key, presentation
  ) values (
    v_battle_id, p_auth_user_id, v_catalog, 'admin_gym', 'active', v_first_actor,
    p_active_slot, 0, p_runtime_owner_id,
    jsonb_build_object('algorithm', 'pgcrypto_independent_bytes', 'entropy_hex', v_entropy,
      'draws', jsonb_build_array(jsonb_build_object('purpose', 'first_actor', 'byte', v_actor_draw))),
    'pending', p_engine_version, p_engine_checksum, p_gym_key,
    v_opponent.presentation || jsonb_build_object('gymKey', p_gym_key, 'opponentKey', v_opponent_key)
  );

  for v_team in select placement.slot_index, pokemon.*
    from public.player_pokemon_placement placement
    join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
    where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team'
    order by placement.slot_index
  loop
    select jsonb_agg(to_jsonb(type_key) order by type_order) into v_types
      from public.catalog_species_type where catalog_release_id = v_catalog and species_key = v_team.species_key;
    select jsonb_agg(jsonb_build_object(
      'move_index', server_authority_private.edge_jsonb_bigint(move -> 0),
      'display_name', catalog.display_name,
      'power', server_authority_private.edge_jsonb_bigint(move -> 1),
      'stats', server_authority_private.edge_jsonb_bigint(move -> 2)) order by ordinality) into v_moves
    from jsonb_array_elements(v_team.state -> 'm') with ordinality known(move, ordinality)
    join public.catalog_move catalog on catalog.catalog_release_id = v_catalog
      and catalog.move_index = server_authority_private.edge_jsonb_bigint(move -> 0);
    insert into public.authoritative_battle_participant(
      battle_id, side, slot_index, pokemon_instance_id, species_key, display_name,
      level, max_hp, current_hp, type_keys, moves, source_snapshot
    ) select v_battle_id, 'player', v_team.slot_index, v_team.id, v_team.species_key,
      species.display_name, server_authority_private.edge_jsonb_bigint(v_team.state -> 'l'),
      server_authority_private.edge_jsonb_bigint(v_team.state -> 'hp'),
      server_authority_private.edge_jsonb_bigint(v_team.state -> 'hp'), v_types, v_moves,
      v_team.state || jsonb_build_object('instance_id', v_team.id, 'instance_revision', v_team.revision)
    from public.catalog_species species where species.catalog_release_id = v_catalog
      and species.species_key = v_team.species_key;
  end loop;

  for v_npc in select pokemon.*, species.display_name, species.experience_reward
    from public.catalog_opponent_pokemon pokemon
    join public.catalog_species species on species.catalog_release_id = pokemon.catalog_release_id
      and species.species_key = pokemon.species_key
    where pokemon.catalog_release_id = v_catalog and pokemon.opponent_key = v_opponent_key
    order by pokemon.slot_index
  loop
    select jsonb_agg(to_jsonb(type_key) order by type_order) into v_types
      from public.catalog_species_type where catalog_release_id = v_catalog and species_key = v_npc.species_key;
    select jsonb_agg(jsonb_build_object('move_index', move.move_index,
      'display_name', catalog.display_name, 'power', move.power, 'stats', move.stats)
      order by move.move_slot_index) into v_moves
    from public.catalog_opponent_move move
    join public.catalog_move catalog on catalog.catalog_release_id = move.catalog_release_id
      and catalog.move_index = move.move_index
    where move.catalog_release_id = v_catalog and move.opponent_key = v_opponent_key
      and move.pokemon_slot_index = v_npc.slot_index;
    insert into public.authoritative_battle_participant(
      battle_id, side, slot_index, pokemon_instance_id, species_key, display_name,
      level, max_hp, current_hp, type_keys, moves, source_snapshot
    ) values (
      v_battle_id, 'npc', v_npc.slot_index, null, v_npc.species_key, v_npc.display_name,
      v_npc.level, v_npc.max_hp, v_npc.max_hp, v_types, v_moves,
      jsonb_build_object('source', 'catalog_opponent', 'opponent_key', v_opponent_key,
        'i', coalesce(v_npc.held_item_index, 0), 'g', v_npc.rules ->> 'gender',
        'sh', case when coalesce((v_npc.rules ->> 'isShiny')::boolean, false) then 1 else 0 end,
        'mg', case when coalesce((v_npc.rules ->> 'isMega')::boolean, false) then 1 else 0 end,
        'xp', coalesce((v_npc.rules ->> 'expCurrent')::integer, 0))
    );
  end loop;

  perform server_authority_private.authoritative_battle_append_event(v_battle_id, 'battle_started',
    jsonb_build_object('contract_key', 'admin_gym', 'gym_key', p_gym_key,
      'opponent_key', v_opponent_key, 'first_actor', v_first_actor,
      'engine_runtime_state', 'pending', 'reward_status', 'pending_first_victory'),
    p_command_id,
    jsonb_build_array(jsonb_build_object('purpose', 'first_actor', 'byte', v_actor_draw, 'result', v_first_actor)));
  update public.player_state_revision set revision = revision + 1, updated_at = now()
    where auth_user_id = p_auth_user_id returning revision into v_revision;
  v_result := jsonb_build_object('player_revision', v_revision, 'engine_runtime_state', 'pending',
    'battle', server_authority_private.authoritative_battle_projection(p_auth_user_id, v_battle_id));
  insert into public.player_command_receipt(auth_user_id, command_id, command_type, request_hash, result, resulting_revision)
  values (p_auth_user_id, p_command_id, 'authoritative_admin_gym_start', v_hash, v_result, v_revision);
  return v_result;
end;
$_$;

CREATE OR REPLACE FUNCTION "public"."start_edge_admin_league_battle_before_ordinary_guard"("p_auth_user_id" "uuid", "p_command_id" "uuid", "p_expected_player_revision" bigint, "p_runtime_owner_id" "uuid", "p_active_slot" integer, "p_expected_member_index" integer, "p_engine_version" "text", "p_engine_checksum" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'extensions', 'pg_temp'
    AS $_$
declare v_request jsonb; v_hash text; v_receipt public.player_command_receipt%rowtype; v_revision bigint;
  v_profile public.player_profile_state%rowtype; v_catalog uuid; v_run public.authoritative_league_run%rowtype;
  v_battle uuid:=gen_random_uuid(); v_entropy text:=encode(gen_random_bytes(16),'hex');
  v_draw integer:=get_byte(gen_random_bytes(1),0); v_first text; v_key text; v_opponent public.catalog_opponent%rowtype;
  v_team record; v_npc record; v_types jsonb; v_moves jsonb; v_level public.catalog_level_rule%rowtype;
  v_move jsonb; v_count integer; v_result jsonb;
begin
  if coalesce(auth.role(),'')<>'service_role' then raise exception 'service role required' using errcode='42501'; end if;
  if p_auth_user_id is null or p_command_id is null or p_runtime_owner_id is null or p_active_slot not between 0 and 5
    or p_expected_member_index is null or p_expected_member_index not between 0 and 4
    or p_engine_checksum !~ '^[0-9a-f]{64}$' then raise exception 'league start envelope is invalid' using errcode='22023'; end if;
  v_request:=jsonb_build_object('command_type','authoritative_admin_league_start','expected_player_revision',p_expected_player_revision,
    'runtime_owner_id',p_runtime_owner_id,'active_slot',p_active_slot,'expected_member_index',p_expected_member_index,
    'engine_version',p_engine_version,'engine_checksum',p_engine_checksum);
  v_hash:=encode(digest(convert_to(v_request::text,'UTF8'),'sha256'),'hex');
  perform pg_advisory_xact_lock(hashtextextended(p_auth_user_id::text||':'||p_command_id::text,0));
  select * into v_receipt from public.player_command_receipt where auth_user_id=p_auth_user_id and command_id=p_command_id;
  if found then
    if v_receipt.command_type<>'authoritative_admin_league_start' or v_receipt.request_hash<>v_hash then
      raise exception 'command id was already used with a different payload' using errcode='22023'; end if;
    return v_receipt.result;
  end if;
  select revision into strict v_revision from public.player_state_revision where auth_user_id=p_auth_user_id for update;
  if v_revision<>p_expected_player_revision then raise exception 'player revision conflict' using errcode='40001'; end if;
  if exists(select 1 from public.authoritative_battle where auth_user_id=p_auth_user_id and status in ('active','needs_player_switch')) then
    raise exception 'an authoritative battle is already active' using errcode='23505'; end if;
  if exists(select 1 from public.player_training_progression where auth_user_id=p_auth_user_id and status<>'completed') then
    raise exception 'complete the pending training progression first' using errcode='55000'; end if;
  select * into strict v_profile from public.player_profile_state where auth_user_id=p_auth_user_id for update;
  v_catalog:=v_profile.catalog_release_id;
  if v_profile.badges<>8 then raise exception 'all eight Kanto badges are required' using errcode='22023'; end if;
  if not exists(select 1 from public.catalog_engine_runtime_binding where catalog_release_id=v_catalog and enabled
    and engine_version=p_engine_version and engine_checksum=p_engine_checksum) then
    raise exception 'player catalog has no enabled battle engine binding' using errcode='0A000'; end if;
  perform server_authority_private.sync_player_missions(p_auth_user_id);
  if not exists(select 1 from public.catalog_mission where catalog_release_id=v_catalog and category_key='adventure' and phase=8)
    or exists(select 1 from public.catalog_mission mission left join public.player_mission_state state
      on state.auth_user_id=p_auth_user_id and state.catalog_release_id=mission.catalog_release_id and state.mission_index=mission.mission_index
      where mission.catalog_release_id=v_catalog and mission.category_key='adventure' and mission.phase=8
        and coalesce(state.claim_status,'') not in ('claimed','skipped')) then
    raise exception 'complete the Kanto adventure prerequisites first' using errcode='22023'; end if;
  if (select count(*) from public.catalog_admin_battle_type where catalog_release_id=v_catalog and admin_controlled and reward_enabled
      and league_battle and battle_type in ('kanto_league_1','kanto_league_2','kanto_league_3','kanto_league_4','kanto_league_champion'))<>5 then
    raise exception 'canonical League admin policy shape is invalid' using errcode='0A000'; end if;
  if exists(select 1 from public.catalog_admin_battle_type where catalog_release_id=v_catalog and league_battle
      and battle_type not in ('kanto_league_1','kanto_league_2','kanto_league_3','kanto_league_4','kanto_league_champion')) then
    raise exception 'unexpected League policy exists' using errcode='0A000'; end if;
  if (select count(*) from public.catalog_opponent where catalog_release_id=v_catalog
      and opponent_key in ('kanto_league_1','kanto_league_2','kanto_league_3','kanto_league_4','kanto_league_champion'))<>5
    or (select count(*) from public.catalog_opponent where catalog_release_id=v_catalog and (
      (opponent_key in ('kanto_league_1','kanto_league_2','kanto_league_3','kanto_league_4') and opponent_kind='league')
      or (opponent_key='kanto_league_champion' and opponent_kind='champion')))<>5
    or (select count(distinct opponent_key) from public.catalog_opponent_pokemon where catalog_release_id=v_catalog
      and opponent_key in ('kanto_league_1','kanto_league_2','kanto_league_3','kanto_league_4','kanto_league_champion'))<>5
    or exists(select 1 from public.catalog_opponent_pokemon pokemon where pokemon.catalog_release_id=v_catalog
      and pokemon.opponent_key in ('kanto_league_1','kanto_league_2','kanto_league_3','kanto_league_4','kanto_league_champion')
      and not exists(select 1 from public.catalog_opponent_move move where move.catalog_release_id=pokemon.catalog_release_id
        and move.opponent_key=pokemon.opponent_key and move.pokemon_slot_index=pokemon.slot_index)) then
    raise exception 'canonical League opponent or roster shape is invalid' using errcode='0A000'; end if;
  if (select count(*) from public.catalog_opponent_reward reward where reward.catalog_release_id=v_catalog
      and reward.opponent_key in ('kanto_league_1','kanto_league_2','kanto_league_3','kanto_league_4','kanto_league_champion'))<>5 then
    raise exception 'each canonical League opponent must have exactly one reward' using errcode='0A000'; end if;
  if (select count(*) from public.catalog_opponent_reward reward where reward.catalog_release_id=v_catalog
      and reward.reward_kind='money' and reward.item_index is null and (
        (reward.opponent_key in ('kanto_league_1','kanto_league_2','kanto_league_3','kanto_league_4') and reward.quantity=25000)
        or (reward.opponent_key='kanto_league_champion' and reward.quantity=30000)))<>5 then
    raise exception 'canonical League rewards do not match KANTO_LEAGUE_REWARDS' using errcode='0A000'; end if;

  select * into v_run from public.authoritative_league_run where auth_user_id=p_auth_user_id
    and status in ('awaiting_battle','active') for update;
  if found then
    if v_run.status<>'awaiting_battle' then raise exception 'League run already has an active battle' using errcode='23505'; end if;
    if v_run.next_member_index<>p_expected_member_index then
      raise exception 'expected League member does not match the canonical sequence' using errcode='40001'; end if;
  else
    if p_expected_member_index<>0 then
      raise exception 'a new League run must start from the first member' using errcode='40001'; end if;
    perform 1 from public.player_pokemon_placement placement join public.player_pokemon_instance pokemon
      on pokemon.id=placement.pokemon_instance_id where placement.auth_user_id=p_auth_user_id
      and placement.placement_type='team' order by placement.slot_index for update of placement,pokemon;
    if not found then raise exception 'a non-empty canonical team is required' using errcode='22023'; end if;
    if exists(select 1 from public.player_pokemon_placement p join public.player_pokemon_instance i on i.id=p.pokemon_instance_id
      where p.auth_user_id=p_auth_user_id and p.placement_type='team' group by i.species_key having count(*)>2) then
      raise exception 'team contains more than two Pokemon of one species' using errcode='22023'; end if;
    if exists(select 1 from public.player_pokemon_placement p join public.player_pokemon_instance i on i.id=p.pokemon_instance_id
      where p.auth_user_id=p_auth_user_id and p.placement_type='team' and coalesce(i.state->>'i','0')<>'0'
      group by i.state->>'i' having count(*)>2) then raise exception 'team contains more than two equal held items' using errcode='22023'; end if;
    select * into strict v_opponent from public.catalog_opponent where catalog_release_id=v_catalog and opponent_key='kanto_league_1';
    select count(*) into v_count from public.player_pokemon_placement p join public.player_pokemon_instance i on i.id=p.pokemon_instance_id
      where p.auth_user_id=p_auth_user_id and p.placement_type='team' and exists(select 1 from jsonb_array_elements(i.state->'m') m
        where server_authority_private.edge_jsonb_bigint(m->0) in (2,132,211,234));
    if v_count>coalesce((v_opponent.rules->>'ohkoPokemonMax')::integer,-1) then raise exception 'team exceeds the League OHKO limit' using errcode='22023'; end if;
    select count(*) into v_count from public.player_pokemon_placement p join public.player_pokemon_instance i on i.id=p.pokemon_instance_id
      join public.catalog_shop_offer offer on offer.catalog_release_id=v_catalog and offer.item_index=server_authority_private.edge_jsonb_bigint(i.state->'i')
        and offer.section_key='port_market' and offer.category_key='port_items'
      where p.auth_user_id=p_auth_user_id and p.placement_type='team';
    if v_count>coalesce((v_opponent.rules->>'portItemMax')::integer,-1) then raise exception 'team exceeds the League Port item limit' using errcode='22023'; end if;
    if exists(select 1 from public.player_pokemon_placement p join public.player_pokemon_instance i on i.id=p.pokemon_instance_id
      join public.catalog_shop_offer offer on offer.catalog_release_id=v_catalog and offer.item_index=server_authority_private.edge_jsonb_bigint(i.state->'i')
        and offer.section_key='port_market' and offer.category_key='port_items'
      where p.auth_user_id=p_auth_user_id and p.placement_type='team' group by i.state->>'i' having count(*)>1) then
      raise exception 'League Port held items must be different' using errcode='22023'; end if;
    insert into public.authoritative_league_run(auth_user_id,catalog_release_id,status,next_member_index)
      values(p_auth_user_id,v_catalog,'awaiting_battle',0) returning * into v_run;
    for v_team in select p.slot_index,i.* from public.player_pokemon_placement p join public.player_pokemon_instance i
      on i.id=p.pokemon_instance_id where p.auth_user_id=p_auth_user_id and p.placement_type='team' order by p.slot_index loop
      select * into v_level from public.catalog_level_rule where catalog_release_id=v_catalog and level=server_authority_private.edge_jsonb_bigint(v_team.state->'l');
      if not found or jsonb_typeof(v_team.state->'m')<>'array' or jsonb_array_length(v_team.state->'m') not between 1 and 4
        or server_authority_private.edge_jsonb_bigint(v_team.state->'hp') not between 1 and (case when v_team.debug_created then 999 else v_level.max_hp end) then raise exception 'canonical League team is invalid' using errcode='0A000'; end if;
      if v_team.state ? 'i' and coalesce(v_team.state->>'i','0')<>'0' and not server_authority_private.held_item_is_compatible(v_catalog,v_team.species_key,(v_team.state->>'i')::integer) then
        raise exception 'held item compatibility is invalid' using errcode='0A000'; end if;
      for v_move in select value from jsonb_array_elements(v_team.state->'m') loop
        if jsonb_array_length(v_move)<>3 or coalesce(server_authority_private.edge_jsonb_bigint(v_move->1),-1) not between 0 and (case when v_team.debug_created then 999 else v_level.max_power end) or coalesce(server_authority_private.edge_jsonb_bigint(v_move->2),-1) not between 0 and (case when v_team.debug_created then 999 else v_level.max_stats end) or not exists(select 1 from public.catalog_move where catalog_release_id=v_catalog
          and move_index=server_authority_private.edge_jsonb_bigint(v_move->0)) then raise exception 'League move is outside the catalog' using errcode='0A000'; end if;
      end loop;
      select jsonb_agg(to_jsonb(type_key) order by type_order) into v_types from public.catalog_species_type
        where catalog_release_id=v_catalog and species_key=v_team.species_key;
      select jsonb_agg(jsonb_build_object('move_index',server_authority_private.edge_jsonb_bigint(m->0),'display_name',c.display_name,
        'power',server_authority_private.edge_jsonb_bigint(m->1),'stats',server_authority_private.edge_jsonb_bigint(m->2)) order by ordinality)
        into v_moves from jsonb_array_elements(v_team.state->'m') with ordinality known(m,ordinality)
        join public.catalog_move c on c.catalog_release_id=v_catalog and c.move_index=server_authority_private.edge_jsonb_bigint(m->0);
      insert into public.authoritative_league_run_pokemon(run_id,slot_index,pokemon_instance_id,species_key,display_name,level,max_hp,type_keys,moves,source_snapshot)
        select v_run.id,v_team.slot_index,v_team.id,v_team.species_key,s.display_name,server_authority_private.edge_jsonb_bigint(v_team.state->'l'),
          server_authority_private.edge_jsonb_bigint(v_team.state->'hp'),v_types,v_moves,v_team.state||jsonb_build_object('instance_id',v_team.id,'instance_revision',v_team.revision)
        from public.catalog_species s where s.catalog_release_id=v_catalog and s.species_key=v_team.species_key;
    end loop;
  end if;
  if not exists(select 1 from public.authoritative_league_run_pokemon where run_id=v_run.id and slot_index=p_active_slot) then
    raise exception 'active frozen team slot does not exist' using errcode='22023'; end if;
  v_key:=case when v_run.next_member_index=4 then 'kanto_league_champion' else 'kanto_league_'||(v_run.next_member_index+1)::text end;
  select * into v_opponent from public.catalog_opponent where catalog_release_id=v_catalog and opponent_key=v_key;
  if not found or not exists(select 1 from public.catalog_admin_battle_type where catalog_release_id=v_catalog and battle_type=v_key
    and admin_controlled and reward_enabled and league_battle) then raise exception 'canonical next League opponent is invalid' using errcode='0A000'; end if;
  if (select count(*) from public.catalog_opponent_reward where catalog_release_id=v_catalog and opponent_key=v_key)<>1
    or (select count(*) from public.catalog_opponent_reward where catalog_release_id=v_catalog and opponent_key=v_key
      and reward_kind='money' and quantity>0 and item_index is null)<>1 then raise exception 'canonical League reward shape is unsupported' using errcode='0A000'; end if;
  v_first:=case when v_run.next_member_index=4 then 'npc' else 'player' end;
  insert into public.authoritative_battle(id,auth_user_id,catalog_release_id,contract_key,status,first_actor,player_active_slot,npc_active_slot,
    runtime_owner_id,rng_state,engine_runtime_state,requested_engine_version,requested_engine_checksum,presentation,league_run_id,league_member_index)
  values(v_battle,p_auth_user_id,v_catalog,'league','active',v_first,p_active_slot,0,p_runtime_owner_id,
    jsonb_build_object('algorithm','pgcrypto_independent_bytes','entropy_hex',v_entropy,'draws',jsonb_build_array(jsonb_build_object('purpose','first_actor','byte',v_draw))),
    'pending',p_engine_version,p_engine_checksum,v_opponent.presentation||jsonb_build_object('opponentKey',v_key),v_run.id,v_run.next_member_index);
  insert into public.authoritative_battle_participant(battle_id,side,slot_index,pokemon_instance_id,species_key,display_name,level,max_hp,current_hp,type_keys,moves,source_snapshot)
    select v_battle,'player',slot_index,pokemon_instance_id,species_key,display_name,level,max_hp,max_hp,type_keys,moves,source_snapshot
    from public.authoritative_league_run_pokemon where run_id=v_run.id order by slot_index;
  for v_npc in select p.*,s.display_name from public.catalog_opponent_pokemon p join public.catalog_species s
    on s.catalog_release_id=p.catalog_release_id and s.species_key=p.species_key
    where p.catalog_release_id=v_catalog and p.opponent_key=v_key order by p.slot_index loop
    select jsonb_agg(to_jsonb(type_key) order by type_order) into v_types from public.catalog_species_type where catalog_release_id=v_catalog and species_key=v_npc.species_key;
    select jsonb_agg(jsonb_build_object('move_index',m.move_index,'display_name',c.display_name,'power',m.power,'stats',m.stats) order by m.move_slot_index)
      into v_moves from public.catalog_opponent_move m join public.catalog_move c on c.catalog_release_id=m.catalog_release_id and c.move_index=m.move_index
      where m.catalog_release_id=v_catalog and m.opponent_key=v_key and m.pokemon_slot_index=v_npc.slot_index;
    insert into public.authoritative_battle_participant(battle_id,side,slot_index,pokemon_instance_id,species_key,display_name,level,max_hp,current_hp,type_keys,moves,source_snapshot)
    values(v_battle,'npc',v_npc.slot_index,null,v_npc.species_key,v_npc.display_name,v_npc.level,v_npc.max_hp,v_npc.max_hp,v_types,v_moves,
      jsonb_build_object('source','catalog_opponent','opponent_key',v_key,'i',coalesce(v_npc.held_item_index,0),'g',v_npc.rules->>'gender',
        'sh',case when coalesce((v_npc.rules->>'isShiny')::boolean,false) then 1 else 0 end,'mg',case when coalesce((v_npc.rules->>'isMega')::boolean,false) then 1 else 0 end));
  end loop;
  update public.authoritative_league_run set status='active',updated_at=now() where id=v_run.id;
  perform server_authority_private.authoritative_battle_append_event(v_battle,'battle_started',jsonb_build_object('contract_key','league',
    'league_run_id',v_run.id,'member_index',v_run.next_member_index,'opponent_key',v_key,'first_actor',v_first),p_command_id,
    jsonb_build_array(jsonb_build_object('purpose','first_actor','byte',v_draw,'result',v_first)));
  update public.player_state_revision set revision=revision+1,updated_at=now() where auth_user_id=p_auth_user_id returning revision into v_revision;
  v_result:=jsonb_build_object('player_revision',v_revision,'engine_runtime_state','pending','battle',server_authority_private.authoritative_battle_projection(p_auth_user_id,v_battle));
  insert into public.player_command_receipt(auth_user_id,command_id,command_type,request_hash,result,resulting_revision)
    values(p_auth_user_id,p_command_id,'authoritative_admin_league_start',v_hash,v_result,v_revision);
  return v_result;
end;
$_$;

CREATE OR REPLACE FUNCTION "public"."start_edge_authoritative_battle_before_ordinary_guard"("p_auth_user_id" "uuid", "p_command_id" "uuid", "p_expected_player_revision" bigint, "p_contract_key" "text", "p_engine_version" "text", "p_engine_checksum" "text", "p_runtime_owner_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'extensions', 'pg_temp'
    AS $_$
declare
  v_request jsonb;
  v_hash text;
  v_receipt public.player_command_receipt%rowtype;
  v_player_revision bigint;
  v_catalog_release_id uuid;
  v_battle_id uuid := gen_random_uuid();
  v_existing_battle public.authoritative_battle%rowtype;
  v_entropy text := encode(gen_random_bytes(16), 'hex');
  v_actor_draw integer := get_byte(gen_random_bytes(1), 0);
  v_first_actor text;
  v_lead record;
  v_team record;
  v_types jsonb;
  v_moves jsonb;
  v_move jsonb;
  v_action_rule public.catalog_move%rowtype;
  v_level_rule public.catalog_level_rule%rowtype;
  v_result jsonb;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if p_auth_user_id is null or p_command_id is null or p_runtime_owner_id is null then
    raise exception 'auth user, command, and runtime owner ids are required' using errcode = '22023';
  end if;
  if p_expected_player_revision is null or p_expected_player_revision < 0 then
    raise exception 'expected player revision must be non-negative' using errcode = '22023';
  end if;
  if p_contract_key is null or p_contract_key <> 'tackle_test' then
    raise exception 'authoritative battle contract is unsupported' using errcode = '0A000';
  end if;
  if p_engine_version is null or length(p_engine_version) not between 1 and 80
    or p_engine_checksum is null or p_engine_checksum !~ '^[0-9a-f]{64}$' then
    raise exception 'engine identity is invalid' using errcode = '22023';
  end if;
  v_request := jsonb_build_object(
    'command_type', 'authoritative_battle_start',
    'expected_player_revision', p_expected_player_revision,
    'contract_key', p_contract_key,
    'runtime_owner_id', p_runtime_owner_id
  );
  v_hash := encode(digest(convert_to(v_request::text, 'UTF8'), 'sha256'), 'hex');
  perform pg_advisory_xact_lock(hashtextextended(p_auth_user_id::text || ':' || p_command_id::text, 0));
  select * into v_receipt from public.player_command_receipt
  where auth_user_id = p_auth_user_id and command_id = p_command_id;
  if found then
    if v_receipt.command_type <> 'authoritative_battle_start' or v_receipt.request_hash <> v_hash then
      raise exception 'command id was already used with a different payload' using errcode = '22023';
    end if;
    if not exists (
      select 1 from public.authoritative_battle battle
      join public.catalog_engine_runtime_binding binding on binding.catalog_release_id = battle.catalog_release_id
      where battle.id::text = v_receipt.result #>> '{battle,battle_id}' and battle.auth_user_id = p_auth_user_id
        and binding.enabled and binding.engine_version = p_engine_version
        and binding.engine_checksum = p_engine_checksum
    ) then raise exception 'incompatible active battle engine binding' using errcode = '0A000'; end if;
    return v_receipt.result;
  end if;

  select revision into v_player_revision from public.player_state_revision
  where auth_user_id = p_auth_user_id for update;
  if not found then raise exception 'player state does not exist' using errcode = 'P0002'; end if;
  select * into v_existing_battle from public.authoritative_battle battle
  where battle.auth_user_id = p_auth_user_id and battle.status in ('active', 'needs_player_switch')
  order by battle.created_at desc limit 1 for update;
  if found then
    if v_existing_battle.contract_key <> p_contract_key then
      raise exception 'an incompatible authoritative battle is already active' using errcode = '23505';
    end if;
    if v_existing_battle.runtime_owner_id <> p_runtime_owner_id then
      raise exception 'runtime lock is owned by another client; explicit takeover is required' using errcode = '55P03';
    end if;
    if not exists (
      select 1 from public.catalog_engine_runtime_binding binding
      where binding.catalog_release_id = v_existing_battle.catalog_release_id and binding.enabled
        and binding.engine_version = p_engine_version and binding.engine_checksum = p_engine_checksum
    ) then raise exception 'incompatible active battle engine binding' using errcode = '0A000'; end if;
    v_result := jsonb_build_object(
      'player_revision', v_player_revision,
      'recovered_existing', true,
      'engine_runtime_state', v_existing_battle.engine_runtime_state,
      'battle', server_authority_private.authoritative_battle_projection(p_auth_user_id, v_existing_battle.id)
    );
    insert into public.player_command_receipt(
      auth_user_id, command_id, command_type, request_hash, result, resulting_revision
    ) values (
      p_auth_user_id, p_command_id, 'authoritative_battle_start', v_hash, v_result, v_player_revision
    );
    return v_result;
  end if;
  if v_player_revision <> p_expected_player_revision then
    raise exception 'player revision conflict: expected %, current %', p_expected_player_revision, v_player_revision using errcode = '40001';
  end if;

  select profile.catalog_release_id into v_catalog_release_id
  from public.player_profile_state profile where profile.auth_user_id = p_auth_user_id;
  if v_catalog_release_id is null then raise exception 'player catalog release is missing' using errcode = 'P0002'; end if;
  if not exists (
    select 1 from public.catalog_engine_runtime_binding binding
    where binding.catalog_release_id = v_catalog_release_id and binding.enabled
      and binding.engine_version = p_engine_version and binding.engine_checksum = p_engine_checksum
  ) then raise exception 'player catalog has no enabled battle engine binding' using errcode = '0A000'; end if;
  select * into v_action_rule from public.catalog_move
  where catalog_release_id = v_catalog_release_id and move_index = 25
    and move_key = 'tackle';
  if not found or jsonb_typeof(v_action_rule.rules -> 'effectKeys') <> 'object'
    or v_action_rule.rules -> 'effectKeys' <> jsonb_build_object(
      'before', 'move.tackle.before',
      'after', 'move.tackle.after'
    ) then
    raise exception 'catalog Azione effects are unsupported by authoritative battle v1' using errcode = '0A000';
  end if;

  perform 1 from public.player_pokemon_placement placement
  join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
  where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team'
  order by pokemon.id for update of pokemon, placement;
  if not found then raise exception 'a non-empty canonical team is required' using errcode = '22023'; end if;

  for v_team in
    select placement.slot_index, pokemon.* from public.player_pokemon_placement placement
    join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
    where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team'
    order by placement.slot_index
  loop
    if jsonb_typeof(v_team.state) is distinct from 'object'
      or jsonb_typeof(v_team.state -> 'm') is distinct from 'array' then
      raise exception 'canonical team Pokemon is unsupported by tackle_test' using errcode = '0A000';
    end if;
    if jsonb_array_length(v_team.state -> 'm') not between 1 and 4
      or server_authority_private.edge_jsonb_bigint(v_team.state -> 'l') not between 1 and 100
      or coalesce(server_authority_private.edge_jsonb_bigint(v_team.state -> 'hp'), 0) <= 0
      or coalesce(server_authority_private.edge_jsonb_bigint(v_team.state -> 'i'), 0) <> 0
      or coalesce(v_team.state ->> 's', '') <> v_team.species_key then
      raise exception 'canonical team Pokemon is unsupported by tackle_test' using errcode = '0A000';
    end if;
    select * into v_level_rule from public.catalog_level_rule
    where catalog_release_id = v_catalog_release_id
      and level = server_authority_private.edge_jsonb_bigint(v_team.state -> 'l');
    if not found or v_team.catalog_release_id <> v_catalog_release_id or v_team.state_version <> 1
      or server_authority_private.edge_jsonb_bigint(v_team.state -> 'hp') > (case when v_team.debug_created then 999 else v_level_rule.max_hp end) then
      raise exception 'canonical team Pokemon is unsupported by tackle_test' using errcode = '0A000';
    end if;
    for v_move in select value from jsonb_array_elements(v_team.state -> 'm') loop
      if jsonb_typeof(v_move) is distinct from 'array' then
        raise exception 'unsupported move in canonical team; tackle_test accepts only Azione' using errcode = '0A000';
      end if;
      if jsonb_array_length(v_move) <> 3
        or server_authority_private.edge_jsonb_bigint(v_move -> 0) <> 25
        or coalesce(server_authority_private.edge_jsonb_bigint(v_move -> 1), 0) <= 0
        or coalesce(server_authority_private.edge_jsonb_bigint(v_move -> 2), -1) < 0
        or server_authority_private.edge_jsonb_bigint(v_move -> 1) > (case when v_team.debug_created then 999 else v_level_rule.max_power end)
        or server_authority_private.edge_jsonb_bigint(v_move -> 2) > (case when v_team.debug_created then 999 else v_level_rule.max_stats end) then
        raise exception 'unsupported move in canonical team; tackle_test accepts only Azione' using errcode = '0A000';
      end if;
    end loop;
  end loop;

  select placement.slot_index, pokemon.* into v_lead
  from public.player_pokemon_placement placement
  join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
  where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team'
  order by placement.slot_index limit 1;
  select * into v_level_rule from public.catalog_level_rule
  where catalog_release_id = v_catalog_release_id
    and level = server_authority_private.edge_jsonb_bigint(v_lead.state -> 'l');
  if not found or v_level_rule.base_power is null then
    raise exception 'catalog level rule cannot construct tackle_test opponent' using errcode = '0A000';
  end if;
  v_first_actor := 'player';

  insert into public.authoritative_battle (
    id, auth_user_id, catalog_release_id, contract_key, status, first_actor,
    player_active_slot, runtime_owner_id, rng_state, engine_runtime_state
  ) values (
    v_battle_id, p_auth_user_id, v_catalog_release_id, p_contract_key, 'active', v_first_actor,
    v_lead.slot_index, p_runtime_owner_id,
    jsonb_build_object('algorithm', 'pgcrypto_independent_bytes', 'entropy_hex', v_entropy,
      'draws', jsonb_build_array(jsonb_build_object('purpose', 'first_actor', 'byte', v_actor_draw))),
    'pending'
  );

  for v_team in
    select placement.slot_index, pokemon.* from public.player_pokemon_placement placement
    join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
    where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team'
    order by placement.slot_index
  loop
    select jsonb_agg(to_jsonb(types.type_key) order by types.type_order) into v_types
    from public.catalog_species_type types where types.catalog_release_id = v_catalog_release_id
      and types.species_key = v_team.species_key;
    if coalesce(jsonb_array_length(v_types), 0) not between 1 and 2 then
      raise exception 'catalog species types are incomplete' using errcode = '0A000';
    end if;
    select jsonb_agg(jsonb_build_object(
      'move_index', 25,
      'display_name', 'tackle',
      'power', server_authority_private.edge_jsonb_bigint(move -> 1),
      'stats', server_authority_private.edge_jsonb_bigint(move -> 2),
      'rules_contract', 'simple_damage'
    ) order by ordinality) into v_moves
    from jsonb_array_elements(v_team.state -> 'm') with ordinality moves(move, ordinality);
    insert into public.authoritative_battle_participant (
      battle_id, side, slot_index, pokemon_instance_id, species_key, display_name,
      level, max_hp, current_hp, type_keys, moves, source_snapshot
    ) select v_battle_id, 'player', v_team.slot_index, v_team.id, v_team.species_key,
      species.display_name,
      server_authority_private.edge_jsonb_bigint(v_team.state -> 'l'),
      server_authority_private.edge_jsonb_bigint(v_team.state -> 'hp'),
      server_authority_private.edge_jsonb_bigint(v_team.state -> 'hp'),
      v_types, v_moves,
      v_team.state || jsonb_build_object('instance_id', v_team.id, 'instance_revision', v_team.revision)
    from public.catalog_species species where species.catalog_release_id = v_catalog_release_id
      and species.species_key = v_team.species_key;
    if not found then raise exception 'catalog species is missing for canonical team' using errcode = 'P0002'; end if;
  end loop;

  select jsonb_agg(to_jsonb(types.type_key) order by types.type_order) into v_types
  from public.catalog_species_type types where types.catalog_release_id = v_catalog_release_id
    and types.species_key = v_lead.species_key;
  v_moves := jsonb_build_array(jsonb_build_object(
    'move_index', 25,
    'display_name', 'tackle',
    'power', v_level_rule.base_power,
    'stats', coalesce(v_level_rule.base_stats, 0),
    'rules_contract', 'simple_damage'
  ));
  insert into public.authoritative_battle_participant (
    battle_id, side, slot_index, pokemon_instance_id, species_key, display_name,
    level, max_hp, current_hp, type_keys, moves, source_snapshot
  ) select v_battle_id, 'npc', 0, null, species.species_key, species.display_name,
    server_authority_private.edge_jsonb_bigint(v_lead.state -> 'l'),
    v_level_rule.max_hp, v_level_rule.max_hp, v_types, v_moves,
    jsonb_build_object('source', 'tackle_test',
      'species_key', species.species_key,
      'level_rule', server_authority_private.edge_jsonb_bigint(v_lead.state -> 'l'))
  from public.catalog_species species where species.catalog_release_id = v_catalog_release_id
    and species.species_key = v_lead.species_key;

  perform server_authority_private.authoritative_battle_append_event(
    v_battle_id,
    'battle_started',
    jsonb_build_object(
      'contract_key', p_contract_key,
      'first_actor', v_first_actor,
      'engine_runtime_state', 'pending',
      'reward_status', 'disabled_edge_first_slice',
      'supported_move_indexes', jsonb_build_array(25)
    ),
    p_command_id,
    jsonb_build_array(jsonb_build_object('purpose', 'first_actor', 'byte', v_actor_draw, 'result', v_first_actor))
  );
  update public.player_state_revision set revision = revision + 1, updated_at = now()
  where auth_user_id = p_auth_user_id returning revision into v_player_revision;
  v_result := jsonb_build_object(
    'player_revision', v_player_revision,
    'recovered_existing', false,
    'engine_runtime_state', 'pending',
    'battle', server_authority_private.authoritative_battle_projection(p_auth_user_id, v_battle_id)
  );
  insert into public.player_command_receipt(
    auth_user_id, command_id, command_type, request_hash, result, resulting_revision
  ) values (
    p_auth_user_id, p_command_id, 'authoritative_battle_start', v_hash, v_result, v_player_revision
  );
  return v_result;
end;
$_$;

CREATE OR REPLACE FUNCTION "public"."start_edge_capture_battle_before_ordinary_guard"("p_auth_user_id" "uuid", "p_command_id" "uuid", "p_expected_player_revision" bigint, "p_runtime_owner_id" "uuid", "p_encounter_id" "uuid", "p_active_slot" integer, "p_engine_version" "text", "p_engine_checksum" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'extensions', 'pg_temp'
    AS $_$
declare
  v_request jsonb; v_hash text; v_receipt public.player_command_receipt%rowtype; v_revision bigint;
  v_profile public.player_profile_state%rowtype; v_encounter public.player_encounter%rowtype;
  v_battle uuid:=gen_random_uuid(); v_entropy text:=encode(gen_random_bytes(16),'hex');
  v_draw integer:=get_byte(gen_random_bytes(1),0); v_first text; v_team record; v_move jsonb;
  v_level public.catalog_level_rule%rowtype; v_types jsonb; v_moves jsonb; v_result jsonb;
begin
  if coalesce(auth.role(),'')<>'service_role' then raise exception 'service role required' using errcode='42501'; end if;
  if p_auth_user_id is null or p_command_id is null or p_runtime_owner_id is null or p_encounter_id is null
    or p_active_slot not between 0 and 5 or p_expected_player_revision<0
    or p_engine_checksum!~'^[0-9a-f]{64}$' then raise exception 'capture start envelope is invalid' using errcode='22023'; end if;
  v_request:=jsonb_build_object('command_type','authoritative_capture_start','expected_player_revision',p_expected_player_revision,
    'runtime_owner_id',p_runtime_owner_id,'encounter_id',p_encounter_id,'active_slot',p_active_slot,
    'engine_version',p_engine_version,'engine_checksum',p_engine_checksum);
  v_hash:=encode(digest(convert_to(v_request::text,'UTF8'),'sha256'),'hex');
  perform pg_advisory_xact_lock(hashtextextended(p_auth_user_id::text||':'||p_command_id::text,0));
  select * into v_receipt from public.player_command_receipt where auth_user_id=p_auth_user_id and command_id=p_command_id;
  if found then
    if v_receipt.command_type<>'authoritative_capture_start' or v_receipt.request_hash<>v_hash then
      raise exception 'command id was reused with a different payload' using errcode='22023'; end if;
    return v_receipt.result;
  end if;
  select revision into strict v_revision from public.player_state_revision where auth_user_id=p_auth_user_id for update;
  if v_revision<>p_expected_player_revision then raise exception 'player revision conflict' using errcode='40001'; end if;
  select * into strict v_profile from public.player_profile_state where auth_user_id=p_auth_user_id for update;
  select * into v_encounter from public.player_encounter where id=p_encounter_id and auth_user_id=p_auth_user_id for update;
  if not found then raise exception 'encounter was not found' using errcode='P0002'; end if;
  if v_encounter.status<>'active' or v_encounter.catalog_release_id<>v_profile.catalog_release_id
    or v_encounter.species_key is null or v_encounter.level not between 1 and 100
    or v_encounter.max_hp<=0 or v_encounter.current_hp not between 1 and v_encounter.max_hp
    or jsonb_typeof(v_encounter.moves)<>'array' or jsonb_array_length(v_encounter.moves) not between 1 and 4 then
    raise exception 'L''incontro non e attivo o pronto per la battaglia.' using errcode='22023'; end if;
  if exists(select 1 from public.authoritative_battle where auth_user_id=p_auth_user_id and status in ('active','needs_player_switch')) then
    raise exception 'an authoritative battle is already active' using errcode='23505'; end if;
  if exists(select 1 from public.authoritative_battle where encounter_id=p_encounter_id) then
    raise exception 'encounter is already bound to a battle' using errcode='23505'; end if;
  if not exists(select 1 from public.catalog_engine_runtime_binding where catalog_release_id=v_profile.catalog_release_id and enabled
    and engine_version=p_engine_version and engine_checksum=p_engine_checksum) then
    raise exception 'player catalog has no enabled battle engine binding' using errcode='0A000'; end if;
  perform 1 from public.player_pokemon_placement p join public.player_pokemon_instance i on i.id=p.pokemon_instance_id
    where p.auth_user_id=p_auth_user_id and p.placement_type='team' order by i.id for update of p,i;
  if not found or not exists(select 1 from public.player_pokemon_placement where auth_user_id=p_auth_user_id
    and placement_type='team' and slot_index=p_active_slot) then raise exception 'canonical active team slot is missing' using errcode='22023'; end if;
  if exists(select 1 from public.player_pokemon_placement p join public.player_pokemon_instance i on i.id=p.pokemon_instance_id
    where p.auth_user_id=p_auth_user_id and p.placement_type='team' group by i.species_key having count(*)>2) then
    raise exception 'team contains more than two Pokemon of one species' using errcode='22023'; end if;
  if exists(select 1 from public.player_pokemon_placement p join public.player_pokemon_instance i on i.id=p.pokemon_instance_id
    where p.auth_user_id=p_auth_user_id and p.placement_type='team' and coalesce(i.state->>'i','0')<>'0'
    group by i.state->>'i' having count(*)>2) then raise exception 'team contains more than two equal held items' using errcode='22023'; end if;
  for v_team in select p.slot_index,i.* from public.player_pokemon_placement p join public.player_pokemon_instance i on i.id=p.pokemon_instance_id
    where p.auth_user_id=p_auth_user_id and p.placement_type='team' order by p.slot_index loop
    select * into v_level from public.catalog_level_rule where catalog_release_id=v_profile.catalog_release_id
      and level=server_authority_private.edge_jsonb_bigint(v_team.state->'l');
    if v_team.catalog_release_id<>v_profile.catalog_release_id or v_team.state_version<>1 or v_team.state->>'s'<>v_team.species_key
      or not found or server_authority_private.edge_jsonb_bigint(v_team.state->'hp') not between 1 and (case when v_team.debug_created then 999 else v_level.max_hp end)
      or jsonb_typeof(v_team.state->'m')<>'array' or jsonb_array_length(v_team.state->'m') not between 1 and 4 then
      raise exception 'canonical team Pokemon is invalid' using errcode='0A000'; end if;
    if coalesce(server_authority_private.edge_jsonb_bigint(v_team.state->'i'),0)>0 and not exists(
      select 1 from public.catalog_item where catalog_release_id=v_profile.catalog_release_id
        and item_index=server_authority_private.edge_jsonb_bigint(v_team.state->'i')) then
      raise exception 'held item is outside the catalog' using errcode='0A000'; end if;
    for v_move in select value from jsonb_array_elements(v_team.state->'m') loop
      if jsonb_typeof(v_move)<>'array' or jsonb_array_length(v_move)<>3
        or coalesce(server_authority_private.edge_jsonb_bigint(v_move->1),-1) not between 0 and (case when v_team.debug_created then 999 else v_level.max_power end) or coalesce(server_authority_private.edge_jsonb_bigint(v_move->2),-1) not between 0 and (case when v_team.debug_created then 999 else v_level.max_stats end) or not exists(select 1 from public.catalog_move where catalog_release_id=v_profile.catalog_release_id
          and move_index=server_authority_private.edge_jsonb_bigint(v_move->0)) then
        raise exception 'team move is outside the catalog' using errcode='0A000'; end if;
    end loop;
  end loop;
  for v_move in select value from jsonb_array_elements(v_encounter.moves) loop
    if jsonb_typeof(v_move)<>'array' or jsonb_array_length(v_move)<>3 or not exists(
      select 1 from public.catalog_move where catalog_release_id=v_encounter.catalog_release_id
        and move_index=server_authority_private.edge_jsonb_bigint(v_move->0)) then
      raise exception 'encounter move is outside the exact catalog' using errcode='0A000'; end if;
  end loop;
  v_first:='player';
  insert into public.authoritative_battle(id,auth_user_id,catalog_release_id,contract_key,status,first_actor,player_active_slot,
    npc_active_slot,runtime_owner_id,rng_state,engine_runtime_state,requested_engine_version,requested_engine_checksum,presentation,encounter_id)
  values(v_battle,p_auth_user_id,v_profile.catalog_release_id,'capture','active',v_first,p_active_slot,0,p_runtime_owner_id,
    jsonb_build_object('algorithm','pgcrypto_independent_bytes','entropy_hex',v_entropy,
      'draws',jsonb_build_array(jsonb_build_object('purpose','first_actor','byte',v_draw))),
    'pending',p_engine_version,p_engine_checksum,jsonb_build_object('name','PokÃ©mon selvatico','zoneKey',v_encounter.zone_key),p_encounter_id);
  for v_team in select p.slot_index,i.* from public.player_pokemon_placement p join public.player_pokemon_instance i on i.id=p.pokemon_instance_id
    where p.auth_user_id=p_auth_user_id and p.placement_type='team' order by p.slot_index loop
    select jsonb_agg(to_jsonb(type_key) order by type_order) into v_types from public.catalog_species_type
      where catalog_release_id=v_profile.catalog_release_id and species_key=v_team.species_key;
    select jsonb_agg(jsonb_build_object('move_index',server_authority_private.edge_jsonb_bigint(m->0),'display_name',c.display_name,
      'power',server_authority_private.edge_jsonb_bigint(m->1),'stats',server_authority_private.edge_jsonb_bigint(m->2)) order by ordinality)
      into v_moves from jsonb_array_elements(v_team.state->'m') with ordinality known(m,ordinality)
      join public.catalog_move c on c.catalog_release_id=v_profile.catalog_release_id and c.move_index=server_authority_private.edge_jsonb_bigint(m->0);
    insert into public.authoritative_battle_participant(battle_id,side,slot_index,pokemon_instance_id,species_key,display_name,
      level,max_hp,current_hp,type_keys,moves,source_snapshot)
    select v_battle,'player',v_team.slot_index,v_team.id,v_team.species_key,s.display_name,
      server_authority_private.edge_jsonb_bigint(v_team.state->'l'),server_authority_private.edge_jsonb_bigint(v_team.state->'hp'),
      server_authority_private.edge_jsonb_bigint(v_team.state->'hp'),v_types,v_moves,
      v_team.state||jsonb_build_object('instance_id',v_team.id,'instance_revision',v_team.revision)
    from public.catalog_species s where s.catalog_release_id=v_profile.catalog_release_id and s.species_key=v_team.species_key;
  end loop;
  select jsonb_agg(to_jsonb(type_key) order by type_order) into v_types from public.catalog_species_type
    where catalog_release_id=v_encounter.catalog_release_id and species_key=v_encounter.species_key;
  select jsonb_agg(jsonb_build_object('move_index',server_authority_private.edge_jsonb_bigint(m->0),'display_name',c.display_name,
    'power',server_authority_private.edge_jsonb_bigint(m->1),'stats',server_authority_private.edge_jsonb_bigint(m->2)) order by ordinality)
    into v_moves from jsonb_array_elements(v_encounter.moves) with ordinality known(m,ordinality)
    join public.catalog_move c on c.catalog_release_id=v_encounter.catalog_release_id and c.move_index=server_authority_private.edge_jsonb_bigint(m->0);
  insert into public.authoritative_battle_participant(battle_id,side,slot_index,pokemon_instance_id,species_key,display_name,
    level,max_hp,current_hp,type_keys,moves,source_snapshot)
  select v_battle,'npc',0,null,v_encounter.species_key,s.display_name,v_encounter.level,v_encounter.max_hp,v_encounter.current_hp,
    v_types,v_moves,jsonb_build_object('source','player_encounter','encounter_id',v_encounter.id,'g',
      case v_encounter.gender_key when 'male' then 'male' when 'female' then 'female' else null end)
  from public.catalog_species s where s.catalog_release_id=v_encounter.catalog_release_id and s.species_key=v_encounter.species_key;
  perform server_authority_private.authoritative_battle_append_event(v_battle,'battle_started',jsonb_build_object(
    'contract_key','capture','encounter_id',p_encounter_id,'first_actor',v_first),p_command_id,
    jsonb_build_array(jsonb_build_object('purpose','first_actor','byte',v_draw,'result',v_first)));
  update public.player_state_revision set revision=revision+1,updated_at=now() where auth_user_id=p_auth_user_id returning revision into v_revision;
  v_result:=jsonb_build_object('player_revision',v_revision,'engine_runtime_state','pending',
    'battle',server_authority_private.authoritative_battle_projection(p_auth_user_id,v_battle));
  insert into public.player_command_receipt(auth_user_id,command_id,command_type,request_hash,result,resulting_revision)
    values(p_auth_user_id,p_command_id,'authoritative_capture_start',v_hash,v_result,v_revision);
  return v_result;
end;
$_$;

CREATE OR REPLACE FUNCTION "public"."start_edge_gym_battle_before_ordinary_guard"("p_auth_user_id" "uuid", "p_command_id" "uuid", "p_expected_player_revision" bigint, "p_runtime_owner_id" "uuid", "p_gym_key" "text", "p_active_slot" integer, "p_engine_version" "text", "p_engine_checksum" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'extensions', 'pg_temp'
    AS $_$
declare
  v_request jsonb;
  v_hash text;
  v_receipt public.player_command_receipt%rowtype;
  v_revision bigint;
  v_catalog uuid;
  v_battle_id uuid := gen_random_uuid();
  v_entropy text := encode(gen_random_bytes(16), 'hex');
  v_actor_draw integer := get_byte(gen_random_bytes(1), 0);
  v_first_actor text;
  v_profile public.player_profile_state%rowtype;
  v_opponent public.catalog_opponent%rowtype;
  v_opponent_key text;
  v_team record;
  v_npc record;
  v_move jsonb;
  v_level public.catalog_level_rule%rowtype;
  v_types jsonb;
  v_moves jsonb;
  v_result jsonb;
  v_limit integer;
  v_count integer;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if p_auth_user_id is null or p_command_id is null or p_runtime_owner_id is null then
    raise exception 'gym start identity is required' using errcode = '22023';
  end if;
  if p_expected_player_revision is null or p_expected_player_revision < 0
    or p_active_slot not between 0 and 5
    or p_gym_key is null or p_gym_key !~ '^[a-z0-9_]{1,40}$'
    or p_engine_version is null or length(p_engine_version) not between 1 and 80
    or p_engine_checksum is null or p_engine_checksum !~ '^[0-9a-f]{64}$' then
    raise exception 'gym start envelope is invalid' using errcode = '22023';
  end if;
  v_request := jsonb_build_object(
    'command_type', 'authoritative_gym_start',
    'expected_player_revision', p_expected_player_revision,
    'runtime_owner_id', p_runtime_owner_id,
    'gym_key', p_gym_key,
    'active_slot', p_active_slot,
    'engine_version', p_engine_version,
    'engine_checksum', p_engine_checksum
  );
  v_hash := encode(digest(convert_to(v_request::text, 'UTF8'), 'sha256'), 'hex');
  perform pg_advisory_xact_lock(hashtextextended(p_auth_user_id::text || ':' || p_command_id::text, 0));
  select * into v_receipt from public.player_command_receipt
  where auth_user_id = p_auth_user_id and command_id = p_command_id;
  if found then
    if v_receipt.command_type <> 'authoritative_gym_start' or v_receipt.request_hash <> v_hash then
      raise exception 'command id was already used with a different payload' using errcode = '22023';
    end if;
    return v_receipt.result;
  end if;

  select revision into v_revision from public.player_state_revision
  where auth_user_id = p_auth_user_id for update;
  if not found then raise exception 'player state does not exist' using errcode = 'P0002'; end if;
  if v_revision <> p_expected_player_revision then
    raise exception 'player revision conflict' using errcode = '40001';
  end if;
  if exists (select 1 from public.authoritative_battle where auth_user_id = p_auth_user_id
    and status in ('active', 'needs_player_switch')) then
    raise exception 'an authoritative battle is already active' using errcode = '23505';
  end if;
  if exists (select 1 from public.player_training_progression
    where auth_user_id = p_auth_user_id and status <> 'completed') then
    raise exception 'complete the pending training progression first' using errcode = '55000';
  end if;

  select * into strict v_profile from public.player_profile_state
  where auth_user_id = p_auth_user_id for update;
  v_catalog := v_profile.catalog_release_id;
  if not exists (select 1 from public.catalog_engine_runtime_binding
    where catalog_release_id = v_catalog and enabled
      and engine_version = p_engine_version and engine_checksum = p_engine_checksum) then
    raise exception 'player catalog has no enabled battle engine binding' using errcode = '0A000';
  end if;
  v_opponent_key := 'gym_' || p_gym_key;
  select * into v_opponent from public.catalog_opponent
  where catalog_release_id = v_catalog and opponent_key = v_opponent_key;
  if not found or v_opponent.opponent_kind <> 'gym' or v_opponent.badge_index is null then
    raise exception 'canonical gym does not exist' using errcode = '22023';
  end if;
  if v_opponent.badge_index <> v_profile.badges
    or coalesce((v_opponent.rules ->> 'unlockBadges')::integer, -1) <> v_profile.badges then
    raise exception 'only the exact next gym may be challenged' using errcode = '22023';
  end if;
  if not exists (select 1 from public.catalog_admin_battle_type admin_type
    where admin_type.catalog_release_id = v_catalog
      and admin_type.battle_type = v_opponent_key and not admin_type.admin_controlled) then
    raise exception 'gym admin policy is missing or requires the admin-controlled battle contract' using errcode = '0A000';
  end if;
  if not exists (select 1 from public.catalog_opponent_pokemon
      where catalog_release_id = v_catalog and opponent_key = v_opponent_key)
    or exists (select 1 from public.catalog_opponent_pokemon
      where catalog_release_id = v_catalog and opponent_key = v_opponent_key
        and held_item_index is not null) then
    raise exception 'gym roster is missing or uses unsupported NPC held items' using errcode = '0A000';
  end if;
  if exists (select 1 from public.catalog_opponent_pokemon pokemon
    where pokemon.catalog_release_id = v_catalog and pokemon.opponent_key = v_opponent_key
      and not exists (select 1 from public.catalog_opponent_move move
        where move.catalog_release_id = pokemon.catalog_release_id
          and move.opponent_key = pokemon.opponent_key
          and move.pokemon_slot_index = pokemon.slot_index)) then
    raise exception 'gym roster has a Pokemon without catalog moves' using errcode = '0A000';
  end if;
  perform server_authority_private.sync_player_missions(p_auth_user_id);
  if not exists (select 1 from public.catalog_mission
      where catalog_release_id = v_catalog and category_key = 'adventure'
        and phase = v_opponent.badge_index + 1)
    or exists (
    select 1 from public.catalog_mission mission
    left join public.player_mission_state mission_state
      on mission_state.auth_user_id = p_auth_user_id
      and mission_state.catalog_release_id = mission.catalog_release_id
      and mission_state.mission_index = mission.mission_index
    where mission.catalog_release_id = v_catalog and mission.category_key = 'adventure'
      and mission.phase = v_opponent.badge_index + 1
      and coalesce(mission_state.claim_status, '') not in ('claimed', 'skipped')
  ) then raise exception 'complete the gym adventure phase first' using errcode = '22023'; end if;

  perform 1 from public.player_pokemon_placement placement
  join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
  where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team'
  order by pokemon.id for update of pokemon, placement;
  if not found then raise exception 'a non-empty canonical team is required' using errcode = '22023'; end if;
  if not exists (select 1 from public.player_pokemon_placement
    where auth_user_id = p_auth_user_id and placement_type = 'team' and slot_index = p_active_slot) then
    raise exception 'active team slot does not exist' using errcode = '22023';
  end if;
  if exists (select 1 from public.player_pokemon_placement placement
    join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
    where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team'
    group by pokemon.species_key having count(*) > 2) then
    raise exception 'team contains more than two Pokemon of one species' using errcode = '22023';
  end if;
  if exists (select 1 from public.player_pokemon_placement placement
    join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
    where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team'
      and coalesce(server_authority_private.edge_jsonb_bigint(pokemon.state -> 'i'), 0) > 0
    group by server_authority_private.edge_jsonb_bigint(pokemon.state -> 'i') having count(*) > 2) then
    raise exception 'team contains more than two equal held items' using errcode = '22023';
  end if;

  v_limit := coalesce((v_opponent.rules ->> 'maxPlayerLevel')::integer, -1);
  for v_team in select placement.slot_index, pokemon.*
    from public.player_pokemon_placement placement
    join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
    where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team'
    order by placement.slot_index
  loop
    if v_team.catalog_release_id <> v_catalog or v_team.state_version <> 1
      or jsonb_typeof(v_team.state) is distinct from 'object'
      or v_team.state ->> 's' <> v_team.species_key
      or server_authority_private.edge_jsonb_bigint(v_team.state -> 'l') not between 1 and v_limit
      or jsonb_typeof(v_team.state -> 'm') is distinct from 'array'
      or jsonb_array_length(v_team.state -> 'm') not between 1 and 4 then
      raise exception 'canonical team Pokemon is not eligible for gym' using errcode = '0A000';
    end if;
    select * into v_level from public.catalog_level_rule where catalog_release_id = v_catalog
      and level = server_authority_private.edge_jsonb_bigint(v_team.state -> 'l');
    if not found or coalesce(server_authority_private.edge_jsonb_bigint(v_team.state -> 'hp'), 0) <= 0
      or server_authority_private.edge_jsonb_bigint(v_team.state -> 'hp') > (case when v_team.debug_created then 999 else v_level.max_hp end) then
      raise exception 'canonical Pokemon HP/level is invalid' using errcode = '0A000';
    end if;
    if v_team.state ? 'i' and coalesce(v_team.state ->> 'i', '') !~ '^[1-9][0-9]*$' then
      raise exception 'canonical held item is malformed' using errcode = '0A000';
    end if;
    if v_team.state ? 'i' and not server_authority_private.held_item_is_compatible(
      v_catalog, v_team.species_key, (v_team.state ->> 'i')::integer) then
      raise exception 'held item category or Pokemon compatibility is invalid' using errcode = '0A000';
    end if;
    for v_move in select value from jsonb_array_elements(v_team.state -> 'm') loop
      if jsonb_typeof(v_move) is distinct from 'array' or jsonb_array_length(v_move) <> 3
        or server_authority_private.edge_jsonb_bigint(v_move -> 0) is null
        or coalesce(server_authority_private.edge_jsonb_bigint(v_move -> 1), -1) not between 0 and (case when v_team.debug_created then 999 else v_level.max_power end)
        or coalesce(server_authority_private.edge_jsonb_bigint(v_move -> 2), -1) not between 0 and (case when v_team.debug_created then 999 else v_level.max_stats end)
        or not exists (select 1 from public.catalog_move where catalog_release_id = v_catalog
          and move_index = server_authority_private.edge_jsonb_bigint(v_move -> 0)) then
        raise exception 'canonical Pokemon move is outside catalog/level caps' using errcode = '0A000';
      end if;
    end loop;
  end loop;

  select count(*) into v_count from public.player_pokemon_placement placement
  join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
  where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team'
    and exists (select 1 from jsonb_array_elements(pokemon.state -> 'm') move
      where server_authority_private.edge_jsonb_bigint(move -> 0) in (2, 132, 211, 234));
  if v_count > coalesce((v_opponent.rules ->> 'ohkoPokemonMax')::integer, -1) then
    raise exception 'team exceeds the gym OHKO Pokemon limit' using errcode = '22023';
  end if;
  select count(*) into v_count from public.player_pokemon_placement placement
  join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
  join public.catalog_shop_offer offer on offer.catalog_release_id = v_catalog
    and offer.item_index = server_authority_private.edge_jsonb_bigint(pokemon.state -> 'i')
    and offer.section_key = 'port_market' and offer.category_key = 'port_items'
  where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team';
  if v_count > coalesce((v_opponent.rules ->> 'portItemMax')::integer, -1) then
    raise exception 'team exceeds the gym Port held-item limit' using errcode = '22023';
  end if;
  if jsonb_typeof(v_opponent.rules -> 'superEffectivePokemonMax') = 'number' then
    select count(*) into v_count
    from public.player_pokemon_placement placement
    join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
    where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team'
      and exists (
        select 1 from public.catalog_opponent_pokemon opponent_pokemon
        where opponent_pokemon.catalog_release_id = v_catalog
          and opponent_pokemon.opponent_key = v_opponent_key
          and (select coalesce(exp(sum(ln(effect.multiplier))), 1)
            from public.catalog_species_type attacker_type
            cross join public.catalog_species_type defender_type
            join public.catalog_type_effectiveness effect
              on effect.catalog_release_id = v_catalog
              and effect.attacker_type_key = attacker_type.type_key
              and effect.defender_type_key = defender_type.type_key
            where attacker_type.catalog_release_id = v_catalog
              and attacker_type.species_key = pokemon.species_key
              and defender_type.catalog_release_id = v_catalog
              and defender_type.species_key = opponent_pokemon.species_key) > 1
      );
    if v_count > (v_opponent.rules ->> 'superEffectivePokemonMax')::integer then
      raise exception 'team exceeds the gym super-effective Pokemon limit' using errcode = '22023';
    end if;
  end if;

  v_first_actor := 'player';
  insert into public.authoritative_battle(
    id, auth_user_id, catalog_release_id, contract_key, status, first_actor,
    player_active_slot, npc_active_slot, runtime_owner_id, rng_state,
    engine_runtime_state, requested_engine_version, requested_engine_checksum,
    gym_key, presentation
  ) values (
    v_battle_id, p_auth_user_id, v_catalog, 'gym', 'active', v_first_actor,
    p_active_slot, 0, p_runtime_owner_id,
    jsonb_build_object('algorithm', 'pgcrypto_independent_bytes', 'entropy_hex', v_entropy,
      'draws', jsonb_build_array(jsonb_build_object('purpose', 'first_actor', 'byte', v_actor_draw))),
    'pending', p_engine_version, p_engine_checksum, p_gym_key,
    v_opponent.presentation || jsonb_build_object('gymKey', p_gym_key, 'opponentKey', v_opponent_key)
  );

  for v_team in select placement.slot_index, pokemon.*
    from public.player_pokemon_placement placement
    join public.player_pokemon_instance pokemon on pokemon.id = placement.pokemon_instance_id
    where placement.auth_user_id = p_auth_user_id and placement.placement_type = 'team'
    order by placement.slot_index
  loop
    select jsonb_agg(to_jsonb(type_key) order by type_order) into v_types
      from public.catalog_species_type where catalog_release_id = v_catalog and species_key = v_team.species_key;
    select jsonb_agg(jsonb_build_object(
      'move_index', server_authority_private.edge_jsonb_bigint(move -> 0),
      'display_name', catalog.display_name,
      'power', server_authority_private.edge_jsonb_bigint(move -> 1),
      'stats', server_authority_private.edge_jsonb_bigint(move -> 2)) order by ordinality) into v_moves
    from jsonb_array_elements(v_team.state -> 'm') with ordinality known(move, ordinality)
    join public.catalog_move catalog on catalog.catalog_release_id = v_catalog
      and catalog.move_index = server_authority_private.edge_jsonb_bigint(move -> 0);
    insert into public.authoritative_battle_participant(
      battle_id, side, slot_index, pokemon_instance_id, species_key, display_name,
      level, max_hp, current_hp, type_keys, moves, source_snapshot
    ) select v_battle_id, 'player', v_team.slot_index, v_team.id, v_team.species_key,
      species.display_name, server_authority_private.edge_jsonb_bigint(v_team.state -> 'l'),
      server_authority_private.edge_jsonb_bigint(v_team.state -> 'hp'),
      server_authority_private.edge_jsonb_bigint(v_team.state -> 'hp'), v_types, v_moves,
      v_team.state || jsonb_build_object('instance_id', v_team.id, 'instance_revision', v_team.revision)
    from public.catalog_species species where species.catalog_release_id = v_catalog
      and species.species_key = v_team.species_key;
  end loop;

  for v_npc in select pokemon.*, species.display_name, species.experience_reward
    from public.catalog_opponent_pokemon pokemon
    join public.catalog_species species on species.catalog_release_id = pokemon.catalog_release_id
      and species.species_key = pokemon.species_key
    where pokemon.catalog_release_id = v_catalog and pokemon.opponent_key = v_opponent_key
    order by pokemon.slot_index
  loop
    select jsonb_agg(to_jsonb(type_key) order by type_order) into v_types
      from public.catalog_species_type where catalog_release_id = v_catalog and species_key = v_npc.species_key;
    select jsonb_agg(jsonb_build_object('move_index', move.move_index,
      'display_name', catalog.display_name, 'power', move.power, 'stats', move.stats)
      order by move.move_slot_index) into v_moves
    from public.catalog_opponent_move move
    join public.catalog_move catalog on catalog.catalog_release_id = move.catalog_release_id
      and catalog.move_index = move.move_index
    where move.catalog_release_id = v_catalog and move.opponent_key = v_opponent_key
      and move.pokemon_slot_index = v_npc.slot_index;
    insert into public.authoritative_battle_participant(
      battle_id, side, slot_index, pokemon_instance_id, species_key, display_name,
      level, max_hp, current_hp, type_keys, moves, source_snapshot
    ) values (
      v_battle_id, 'npc', v_npc.slot_index, null, v_npc.species_key, v_npc.display_name,
      v_npc.level, v_npc.max_hp, v_npc.max_hp, v_types, v_moves,
      jsonb_build_object('source', 'catalog_opponent', 'opponent_key', v_opponent_key,
        'i', coalesce(v_npc.held_item_index, 0), 'g', v_npc.rules ->> 'gender',
        'sh', case when coalesce((v_npc.rules ->> 'isShiny')::boolean, false) then 1 else 0 end,
        'mg', case when coalesce((v_npc.rules ->> 'isMega')::boolean, false) then 1 else 0 end,
        'xp', coalesce((v_npc.rules ->> 'expCurrent')::integer, 0))
    );
  end loop;

  perform server_authority_private.authoritative_battle_append_event(v_battle_id, 'battle_started',
    jsonb_build_object('contract_key', 'gym', 'gym_key', p_gym_key,
      'opponent_key', v_opponent_key, 'first_actor', v_first_actor,
      'engine_runtime_state', 'pending', 'reward_status', 'pending_first_victory'),
    p_command_id,
    jsonb_build_array(jsonb_build_object('purpose', 'first_actor', 'byte', v_actor_draw, 'result', v_first_actor)));
  update public.player_state_revision set revision = revision + 1, updated_at = now()
    where auth_user_id = p_auth_user_id returning revision into v_revision;
  v_result := jsonb_build_object('player_revision', v_revision, 'engine_runtime_state', 'pending',
    'battle', server_authority_private.authoritative_battle_projection(p_auth_user_id, v_battle_id));
  insert into public.player_command_receipt(auth_user_id, command_id, command_type, request_hash, result, resulting_revision)
  values (p_auth_user_id, p_command_id, 'authoritative_gym_start', v_hash, v_result, v_revision);
  return v_result;
end;
$_$;

CREATE OR REPLACE FUNCTION "public"."start_wild_encounter_before_revision_guard"("p_command_id" "uuid", "p_expected_revision" bigint, "p_zone_key" "text", "p_requested_level" integer, "p_search_mode" "jsonb", "p_flute_choice" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'extensions', 'pg_temp'
    AS $_$
declare
  v_auth_user_id uuid := auth.uid();
  v_profile public.player_profile_state%rowtype;
  v_revision bigint;
  v_request jsonb;
  v_request_hash text;
  v_receipt record;
  v_range_index integer;
  v_type_key text;
  v_range record;
  v_capture_limit integer;
  v_level integer;
  v_flute_choice text := coalesce(nullif(btrim(p_flute_choice), ''), 'none');
  v_use_white boolean;
  v_use_black boolean;
  v_white_item integer;
  v_black_item integer;
  v_daily_limit integer;
  v_today date := (now() at time zone 'Europe/Rome')::date;
  v_species record;
  v_gender text;
  v_level_rule public.catalog_level_rule%rowtype;
  v_hp_delta integer;
  v_max_hp integer;
  v_moves jsonb;
  v_encounter_id uuid := gen_random_uuid();
  v_result jsonb;
begin
  if v_auth_user_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if p_command_id is null or p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'valid command id and expected revision are required' using errcode = '22023';
  end if;
  if nullif(btrim(p_zone_key), '') is null then
    raise exception 'zone key is required' using errcode = '22023';
  end if;
  if jsonb_typeof(p_search_mode) is distinct from 'object'
     or p_search_mode - array['rangeIndex', 'typeKey']::text[] <> '{}'::jsonb
     or jsonb_typeof(p_search_mode -> 'rangeIndex') is distinct from 'number'
     or (p_search_mode ->> 'rangeIndex') !~ '^[0-9]+$'
     or jsonb_typeof(p_search_mode -> 'typeKey') is distinct from 'string' then
    raise exception 'search mode must contain only rangeIndex and typeKey' using errcode = '22023';
  end if;
  v_range_index := (p_search_mode ->> 'rangeIndex')::integer;
  v_type_key := nullif(btrim(p_search_mode ->> 'typeKey'), '');
  if v_flute_choice not in ('none', 'white', 'black', 'both') then
    raise exception 'flute choice is not valid' using errcode = '22023';
  end if;
  v_use_white := v_flute_choice in ('white', 'both');
  v_use_black := v_flute_choice in ('black', 'both');
  if v_use_white <> (p_requested_level is not null) then
    raise exception 'requested level is allowed and required only with the white flute' using errcode = '22023';
  end if;

  v_request := jsonb_build_object(
    'command_type', 'wild_encounter_start', 'expected_revision', p_expected_revision,
    'zone_key', btrim(p_zone_key), 'requested_level', p_requested_level,
    'search_mode', p_search_mode, 'flute_choice', v_flute_choice
  );
  v_request_hash := encode(digest(convert_to(v_request::text, 'UTF8'), 'sha256'), 'hex');
  perform pg_advisory_xact_lock(hashtextextended(v_auth_user_id::text || ':' || p_command_id::text, 0));

  select command_type, request_hash, result into v_receipt
  from public.player_command_receipt
  where auth_user_id = v_auth_user_id and command_id = p_command_id;
  if found then
    if v_receipt.command_type <> 'wild_encounter_start' or v_receipt.request_hash <> v_request_hash then
      raise exception 'command id was already used with a different payload' using errcode = '22023';
    end if;
    return v_receipt.result;
  end if;

  select * into v_profile from public.player_profile_state
  where auth_user_id = v_auth_user_id for update;
  if not found or v_profile.starter_status <> 'selected' then
    raise exception 'player profile is not ready' using errcode = 'P0002';
  end if;
  select revision into v_revision from public.player_state_revision
  where auth_user_id = v_auth_user_id for update;
  if v_revision is null or v_revision <> p_expected_revision then
    raise exception 'revision conflict: expected %, current %', p_expected_revision, coalesce(v_revision, 0) using errcode = '40001';
  end if;
  if not exists (
    select 1 from public.catalog_release release
    where release.id = v_profile.catalog_release_id and release.status in ('draft', 'published')
  ) then
    raise exception 'encounter catalog release is not ready';
  end if;
  if not exists (
    select 1 from public.catalog_zone zone
    where zone.catalog_release_id = v_profile.catalog_release_id and zone.zone_key = btrim(p_zone_key)
  ) then
    raise exception 'capture zone was not found' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.catalog_zone_access_requirement requirement
    where requirement.catalog_release_id = v_profile.catalog_release_id
      and requirement.zone_key = btrim(p_zone_key)
      and not exists (
        select 1 from public.player_inventory_item inventory
        where inventory.auth_user_id = v_auth_user_id
          and inventory.item_index = requirement.item_index and inventory.quantity > 0
      )
  ) then
    raise exception 'zone access requirement is not satisfied' using errcode = '42501';
  end if;

  select (rule.rules ->> 'level')::integer into v_capture_limit
  from public.catalog_progression_rule rule
  where rule.catalog_release_id = v_profile.catalog_release_id
    and rule.rule_family = 'capture_level_limit'
    and rule.rule_key = least(8, greatest(0, v_profile.badges))::text
    and jsonb_typeof(rule.rules -> 'level') = 'number';
  if v_capture_limit is null or v_capture_limit < 5 or v_capture_limit > 60 then
    raise exception 'capture level cap catalog rule is incomplete';
  end if;

  select range_row.* into v_range
  from (
    select row_number() over (order by rule.sort_order) - 1 as range_index,
           (rule.rules ->> 'min')::integer as min_level,
           (rule.rules ->> 'max')::integer as max_level
    from public.catalog_progression_rule rule
    where rule.catalog_release_id = v_profile.catalog_release_id
      and rule.rule_family = 'capture_level_range'
      and (rule.rules ->> 'badges')::integer <= least(8, greatest(0, v_profile.badges))
      and jsonb_typeof(rule.rules -> 'min') = 'number'
      and jsonb_typeof(rule.rules -> 'max') = 'number'
  ) range_row where range_row.range_index = v_range_index;
  if not found or v_range.min_level < 5 or v_range.max_level > v_capture_limit or v_range.min_level > v_range.max_level then
    raise exception 'capture level range is not unlocked' using errcode = '22023';
  end if;

  if v_use_white then
    if p_requested_level < 5 or p_requested_level > v_capture_limit or not exists (
      select 1
      from public.catalog_progression_rule rule
      where rule.catalog_release_id = v_profile.catalog_release_id
        and rule.rule_family = 'capture_level_range'
        and (rule.rules ->> 'badges')::integer <= least(8, greatest(0, v_profile.badges))
        and p_requested_level between (rule.rules ->> 'min')::integer and (rule.rules ->> 'max')::integer
    ) then
      raise exception 'requested level is not unlocked' using errcode = '22023';
    end if;
    v_level := p_requested_level;
  else
    v_level := v_range.min_level + floor(random() * (v_range.max_level - v_range.min_level + 1))::integer;
  end if;
  if v_use_black then
    if v_type_key is null or not exists (
      select 1 from public.catalog_zone_type zone_type
      where zone_type.catalog_release_id = v_profile.catalog_release_id
        and zone_type.zone_key = btrim(p_zone_key) and zone_type.type_key = v_type_key
    ) then
      raise exception 'requested type is not available in this zone' using errcode = '22023';
    end if;
  end if;

  select (rule.rules ->> 'value')::integer into v_daily_limit
  from public.catalog_progression_rule rule
  where rule.catalog_release_id = v_profile.catalog_release_id
    and rule.rule_family = 'constant' and rule.rule_key = 'flute_daily_use_limit'
    and jsonb_typeof(rule.rules -> 'value') = 'number';
  select (rule.rules ->> 'itemIndex')::integer into v_white_item
  from public.catalog_progression_rule rule
  where rule.catalog_release_id = v_profile.catalog_release_id
    and rule.rule_family = 'search_tool' and rule.rule_key = 'whiteFlute';
  select (rule.rules ->> 'itemIndex')::integer into v_black_item
  from public.catalog_progression_rule rule
  where rule.catalog_release_id = v_profile.catalog_release_id
    and rule.rule_family = 'search_tool' and rule.rule_key = 'blackFlute';
  if v_daily_limit is null or v_daily_limit <= 0 or v_white_item is null or v_black_item is null then
    raise exception 'search tool catalog rules are incomplete';
  end if;

  if v_use_white then
    if not exists (select 1 from public.player_inventory_item where auth_user_id = v_auth_user_id and item_index = v_white_item and quantity > 0) then
      raise exception 'white flute is not in inventory' using errcode = '22023';
    end if;
    insert into public.player_flute_daily_usage(auth_user_id, usage_date, flute_key, use_count, last_used_at)
    values (v_auth_user_id, v_today, 'flute_white', 1, now())
    on conflict (auth_user_id, usage_date, flute_key) do update
      set use_count = public.player_flute_daily_usage.use_count + 1, last_used_at = now()
      where public.player_flute_daily_usage.use_count < v_daily_limit;
    if not found then raise exception 'white flute daily limit reached' using errcode = 'P0001'; end if;
  end if;
  if v_use_black then
    if not exists (select 1 from public.player_inventory_item where auth_user_id = v_auth_user_id and item_index = v_black_item and quantity > 0) then
      raise exception 'black flute is not in inventory' using errcode = '22023';
    end if;
    insert into public.player_flute_daily_usage(auth_user_id, usage_date, flute_key, use_count, last_used_at)
    values (v_auth_user_id, v_today, 'flute_black', 1, now())
    on conflict (auth_user_id, usage_date, flute_key) do update
      set use_count = public.player_flute_daily_usage.use_count + 1, last_used_at = now()
      where public.player_flute_daily_usage.use_count < v_daily_limit;
    if not found then raise exception 'black flute daily limit reached' using errcode = 'P0001'; end if;
  end if;

  select candidate.* into v_species
  from (
    select species.species_key, species.encounter_rarity_key, species.experience_reward,
           rarity.encounter_weight
    from public.catalog_species species
    join public.catalog_rarity_rule rarity
      on rarity.catalog_release_id = species.catalog_release_id
     and rarity.rarity_key = species.encounter_rarity_key and rarity.encounter_weight > 0
    where species.catalog_release_id = v_profile.catalog_release_id
      and v_level between species.encounter_min_level and species.encounter_max_level
      and exists (
        select 1 from public.catalog_species_type species_type
        where species_type.catalog_release_id = species.catalog_release_id
          and species_type.species_key = species.species_key
          and (
            (v_use_black and species_type.type_key = v_type_key)
            or (not v_use_black and exists (
              select 1 from public.catalog_zone_type zone_type
              where zone_type.catalog_release_id = species_type.catalog_release_id
                and zone_type.zone_key = btrim(p_zone_key)
                and zone_type.type_key = species_type.type_key
            ))
          )
      )
  ) candidate
  order by -ln(greatest(random(), 0.000000000001)) / candidate.encounter_weight
  limit 1;
  if not found then
    raise exception 'no eligible species exists for this search' using errcode = 'P0002';
  end if;

  select gender.gender_key into v_gender
  from public.catalog_species_gender gender
  where gender.catalog_release_id = v_profile.catalog_release_id and gender.species_key = v_species.species_key
  order by random() limit 1;
  if v_gender not in ('male', 'female') and v_gender is not null then
    raise exception 'encounter gender cannot be projected: %', v_gender;
  end if;
  select * into v_level_rule from public.catalog_level_rule
  where catalog_release_id = v_profile.catalog_release_id and level = v_level;
  if not found or v_level_rule.base_hp is null or v_level_rule.base_power is null or v_level_rule.base_stats is null then
    raise exception 'encounter level rules are incomplete';
  end if;
  v_hp_delta := case when v_level >= 35 then 4 when v_level >= 15 then 2 else 0 end;
  v_max_hp := v_level_rule.base_hp - floor(random() * (v_hp_delta + 1))::integer;

  select jsonb_agg(jsonb_build_array(selected_move.move_index,
    v_level_rule.base_power - floor(random() * (case when v_level >= 50 then 5 when v_level >= 20 then 4 when v_level >= 10 then 3 else 1 end))::integer,
    v_level_rule.base_stats - floor(random() * (case when v_level >= 40 then 3 else 1 end))::integer
  ) order by selected_move.random_order) into v_moves
  from (
    select level_move.move_index, random() as random_order
    from public.catalog_species_level_move level_move
    where level_move.catalog_release_id = v_profile.catalog_release_id
      and level_move.species_key = v_species.species_key and level_move.level <= v_level
    order by random() limit 4
  ) selected_move;
  if v_moves is null or jsonb_array_length(v_moves) = 0 then
    raise exception 'eligible encounter has no move at this level';
  end if;

  update public.player_encounter set status = case when expires_at <= now() then 'expired' else 'cancelled' end
  where auth_user_id = v_auth_user_id and status = 'active';
  insert into public.player_encounter(
    id, auth_user_id, catalog_release_id, zone_key, encounter_state, status, expires_at,
    species_key, level, gender_key, rarity_key, max_hp, current_hp, moves, search_mode, flute_choice
  ) values (
    v_encounter_id, v_auth_user_id, v_profile.catalog_release_id, btrim(p_zone_key),
    jsonb_build_object('contract', 'wild-encounter'), 'active', now() + interval '30 minutes',
    v_species.species_key, v_level, v_gender, v_species.encounter_rarity_key,
    v_max_hp, v_max_hp,
    v_moves, p_search_mode, v_flute_choice
  );

  update public.player_state_revision set revision = revision + 1, updated_at = now()
  where auth_user_id = v_auth_user_id returning revision into v_revision;
  v_result := server_authority_private.player_state_projection(v_auth_user_id)
    || jsonb_build_object('command_id', p_command_id, 'command_type', 'wild_encounter_start');
  insert into public.player_command_receipt(auth_user_id, command_id, command_type, request_hash, result, resulting_revision)
  values (v_auth_user_id, p_command_id, 'wild_encounter_start', v_request_hash, v_result, v_revision);
  return v_result;
end;
$_$;

CREATE OR REPLACE FUNCTION "public"."validate_extended_catalog_on_publish"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions', 'pg_temp'
    AS $$
declare v_entries text;
begin
  if not (old.status = 'draft' and new.status = 'published') then return new; end if;
  if exists (
    select 1 from public.catalog_training_reward_rule reward
    join public.catalog_progression_rule daily on daily.catalog_release_id=reward.catalog_release_id
      and daily.rule_family='training_daily_reward' and daily.rule_key=reward.badge_count||'.'||reward.difficulty
    join public.catalog_progression_rule repeat on repeat.catalog_release_id=reward.catalog_release_id
      and repeat.rule_family='training_repeat_reward' and repeat.rule_key=reward.difficulty
    where reward.catalog_release_id=new.id and (
      reward.daily_battle_points<>(daily.rules->>'battlePoints')::integer
      or reward.repeat_battle_points<>(repeat.rules->>'battlePoints')::integer
    )
  ) then raise exception 'training Battle Point rules diverge from canonical progression rules'; end if;
  select string_agg(entry, E'\n' order by entry) into v_entries from (
    select 'type_effect:' || jsonb_build_array(attacker_type_key, defender_type_key, multiplier)::text entry from public.catalog_type_effectiveness where catalog_release_id = new.id
    union all select 'level:' || jsonb_build_array(level, base_hp, base_power, base_stats, max_hp, max_power, max_stats)::text from public.catalog_level_rule where catalog_release_id = new.id
    union all select 'pve:' || jsonb_build_array(category_key, move_index, sort_order)::text from public.catalog_pve_move_category where catalog_release_id = new.id
    union all select 'zone_access:' || jsonb_build_array(zone_key, item_index, presentation)::text from public.catalog_zone_access_requirement where catalog_release_id = new.id
    union all select 'mission:' || jsonb_build_array(mission_index, category_key, mission_type, target, phase, sequence, rules, reward_rules, presentation)::text from public.catalog_mission where catalog_release_id = new.id
    union all select 'opponent:' || jsonb_build_array(opponent_key, opponent_kind, sort_order, badge_index, rules, presentation)::text from public.catalog_opponent where catalog_release_id = new.id
    union all select 'opponent_pokemon:' || jsonb_build_array(opponent_key, slot_index, species_key, level, max_hp, held_item_index, rules)::text from public.catalog_opponent_pokemon where catalog_release_id = new.id
    union all select 'opponent_move:' || jsonb_build_array(opponent_key, pokemon_slot_index, move_slot_index, move_index, power, stats)::text from public.catalog_opponent_move where catalog_release_id = new.id
    union all select 'opponent_reward:' || jsonb_build_array(opponent_key, reward_order, reward_kind, item_index, quantity, rules, presentation)::text from public.catalog_opponent_reward where catalog_release_id = new.id
    union all select 'admin_type:' || jsonb_build_array(battle_type, admin_controlled, reward_enabled, league_battle)::text from public.catalog_admin_battle_type where catalog_release_id = new.id
    union all select 'admin_item:' || jsonb_build_array(item_index, quantity)::text from public.catalog_admin_battle_item where catalog_release_id = new.id
    union all select 'trainer_avatar:' || jsonb_build_array(trainer_index, gender_key, presentation)::text from public.catalog_trainer_avatar where catalog_release_id = new.id
    union all select 'trainer_name:' || jsonb_build_array(gender_key, sort_order, display_name)::text from public.catalog_trainer_name where catalog_release_id = new.id
    union all select 'shop_extended:' || jsonb_build_array(offer_key, sort_order, purchase_enabled, sale_enabled, single_purchase, unlock_rules, sale_rules)::text from public.catalog_shop_offer where catalog_release_id = new.id
    union all select 'daycare:' || jsonb_build_array(level_interval_seconds, withdraw_base_cost, withdraw_level_cost, max_pending_levels, badge_level_limits)::text from public.catalog_daycare_rule where catalog_release_id = new.id
    union all select 'training_reward:' || jsonb_build_array(badge_count, difficulty, daily_levels, daily_money, daily_battle_points, repeat_levels, repeat_money, repeat_battle_points, level_cap, max_levels_per_pokemon)::text from public.catalog_training_reward_rule where catalog_release_id = new.id
  ) extended_rows;
  new.checksum := 'sha256:' || encode(digest(convert_to(new.checksum || E'\n' || coalesce(v_entries, ''), 'UTF8'), 'sha256'), 'hex');
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION "server_authority_private"."active_encounter_projection"("p_auth_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'extensions', 'pg_temp'
    AS $$
  select (select jsonb_build_object(
    'encounter_id',e.id,'zone_key',e.zone_key,'current_hp',e.current_hp,
    'max_hp',e.max_hp,'search_mode',e.search_mode,'flute_choice',e.flute_choice,
    'battle_id',(select b.id from public.authoritative_battle b where b.encounter_id=e.id
      and b.status in ('active','needs_player_switch') limit 1),
    'pokemon',jsonb_build_object('s',e.species_key,'g',case e.gender_key when 'male' then 'male' when 'female' then 'female' else null end,
      'l',e.level,'hp',e.max_hp,'m',e.moves,'xp',0,'catalog_release_id',e.catalog_release_id))
  from public.player_encounter e where e.auth_user_id=p_auth_user_id and e.status='active'
    and e.species_key is not null order by e.created_at desc limit 1)
$$;

CREATE OR REPLACE FUNCTION "server_authority_private"."adopt_edge_training_initialization_before_move_availability"("p_auth_user_id" "uuid", "p_battle_id" "uuid", "p_next_snapshot" "jsonb", "p_projection" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'pg_temp'
    AS $$
declare
  v_battle public.authoritative_battle%rowtype;
  v_player_count integer;
  v_npc_count integer;
  v_highest integer;
  v_level integer;
  v_delta integer;
  v_entry jsonb;
  v_slot integer;
  v_species public.catalog_species%rowtype;
  v_level_rule public.catalog_level_rule%rowtype;
  v_types jsonb;
  v_moves jsonb;
  v_presentation jsonb;
  v_encounter_level integer;
  v_generated_hp integer;
  v_hp_delta integer;
  v_power_delta integer;
  v_stats_delta integer;
begin
  select * into strict v_battle from public.authoritative_battle
    where id = p_battle_id and auth_user_id = p_auth_user_id for update;
  if v_battle.contract_key <> 'training' or v_battle.engine_runtime_state <> 'pending' then
    raise exception 'training initialization aggregate is invalid' using errcode = '40001';
  end if;
  if p_projection ->> 'training_difficulty' <> v_battle.training_difficulty
    or p_next_snapshot #>> '{manager,battleType}' <> 'training'
    or p_next_snapshot #>> '{manager,trainingDifficulty}' <> v_battle.training_difficulty then
    raise exception 'training contract metadata diverges' using errcode = '22023';
  end if;
  select count(*), max(level) into v_player_count, v_highest from public.authoritative_battle_participant
    where battle_id = p_battle_id and side = 'player';
  v_npc_count := jsonb_array_length(p_next_snapshot #> '{enemyTeam,pokemon}');
  if v_player_count not between 1 and 6 or v_npc_count <> v_player_count
    or jsonb_array_length(p_next_snapshot #> '{playerTeam,pokemon}') <> v_player_count
    or jsonb_array_length(p_next_snapshot #> '{playerTeam,combatants}') <> v_player_count
    or jsonb_array_length(p_next_snapshot #> '{enemyTeam,combatants}') <> v_player_count
    or jsonb_array_length(p_projection -> 'participants') <> v_player_count * 2 then
    raise exception 'training opponent team size is invalid' using errcode = '22023';
  end if;
  if (select count(distinct server_authority_private.edge_jsonb_bigint(value #> '{state,authoritativeSlot}'))
      from jsonb_array_elements(p_next_snapshot #> '{playerTeam,pokemon}')) <> v_player_count
    or (select count(distinct server_authority_private.edge_jsonb_bigint(value #> '{state,authoritativeSlot}'))
      from jsonb_array_elements(p_next_snapshot #> '{enemyTeam,pokemon}')) <> v_player_count
    or (select count(distinct (value ->> 'side', server_authority_private.edge_jsonb_bigint(value -> 'slot_index')))
      from jsonb_array_elements(p_projection -> 'participants')) <> v_player_count * 2 then
    raise exception 'training snapshot/projection slots are duplicated or omitted' using errcode = '22023';
  end if;
  v_delta := case v_battle.training_difficulty when 'easy' then -5 when 'medium' then 0 when 'hard' then 5 else null end;
  v_level := greatest(5, least(100, v_highest + v_delta));
  v_encounter_level := least(v_level, 60);
  v_hp_delta := case when v_level >= 35 then 4 when v_level >= 15 then 2 else 0 end;
  v_power_delta := case when v_level >= 50 then 4 when v_level >= 20 then 3 when v_level >= 10 then 2 else 0 end;
  v_stats_delta := case when v_level >= 40 then 2 else 0 end;
  v_presentation := p_projection -> 'presentation';
  if jsonb_typeof(v_presentation) is distinct from 'object'
    or length(btrim(coalesce(v_presentation ->> 'name', ''))) not between 1 and 64
    or v_presentation ->> 'gender' not in ('m', 'f')
    or v_presentation ->> 'sprite' not in ('avicoltore.webp','bellezza.webp','bimba.webp','bimbo.webp','brandifuoco.webp','chitarrista.webp','cinturanera.webp','domadraghi.webp','fantallenatore.webp','fantallenatrice.webp','fantallenatore_v2.webp','fantallenatrice_v2.webp','gentiluomo.webp','lady.webp','marinaio.webp','pokefanatico.webp','pupa.webp','ranger_f.webp','ranger_m.webp','scienziata.webp','sensitivo.webp','specialista_f.webp','specialista_m.webp','elegantone.webp','domestica.webp','ciambellino.webp','ciambellina.webp','madame.webp','pupa_2.webp','profumina.webp','pescatrice_di_perle.webp','ombrellina.webp','ninja.webp','campeggiatore.webp','campeggiatrice.webp','giardiniere.webp','giramondo.webp','ragazza_delle_fiabe.webp')
    or p_next_snapshot -> 'presentation' is distinct from v_presentation then
    raise exception 'training presentation is invalid' using errcode = '22023';
  end if;

  -- Player roster identity, HP, types and complete move list must remain exactly
  -- the canonical pending participant snapshot.
  if exists (
    select 1 from jsonb_array_elements(p_next_snapshot #> '{playerTeam,pokemon}') with ordinality pokemon(value, ordinality)
    join jsonb_array_elements(p_next_snapshot #> '{playerTeam,combatants}') with ordinality combatant(value, ordinality) using (ordinality)
    left join public.authoritative_battle_participant participant on participant.battle_id = p_battle_id and participant.side = 'player'
      and participant.slot_index = server_authority_private.edge_jsonb_bigint(pokemon.value #> '{state,authoritativeSlot}')
    where participant.battle_id is null or participant.species_key <> pokemon.value #>> '{state,speciesKey}'
      or participant.display_name <> pokemon.value #>> '{state,name}'
      or participant.level <> server_authority_private.edge_jsonb_bigint(pokemon.value #> '{state,level}')
      or participant.max_hp <> server_authority_private.edge_jsonb_bigint(pokemon.value #> '{state,maxHp}')
      or participant.current_hp <> server_authority_private.edge_jsonb_bigint(combatant.value #> '{state,hp}')
      or participant.type_keys <> pokemon.value #> '{state,type}'
      or participant.pokemon_instance_id::text <> pokemon.value #>> '{state,instanceId}'
      or pokemon.value #>> '{state,catalogReleaseId}' <> v_battle.catalog_release_id::text
      or pokemon.value #>> '{state,gender}' is distinct from participant.source_snapshot ->> 'g'
      or coalesce(server_authority_private.edge_jsonb_boolean(pokemon.value #> '{state,isShiny}'), false)
        <> (coalesce(server_authority_private.edge_jsonb_bigint(participant.source_snapshot -> 'sh'), 0) = 1)
      or coalesce(server_authority_private.edge_jsonb_boolean(pokemon.value #> '{state,isMega}'), false)
        <> (coalesce(server_authority_private.edge_jsonb_bigint(participant.source_snapshot -> 'mg'), 0) = 1)
      or coalesce(server_authority_private.edge_jsonb_bigint(participant.source_snapshot -> 'instance_revision'), 0)
        <> server_authority_private.edge_jsonb_bigint(pokemon.value #> '{state,instanceRevision}')
      or coalesce(server_authority_private.edge_jsonb_bigint(participant.source_snapshot -> 'i'), 0)
        <> coalesce(server_authority_private.edge_jsonb_bigint(pokemon.value #> '{state,heldItemIndex}'), 0)
      or coalesce(server_authority_private.edge_jsonb_bigint(participant.source_snapshot -> 'xp'), 0)
        <> coalesce(server_authority_private.edge_jsonb_bigint(pokemon.value #> '{state,expCurrent}'), 0)
      or server_authority_private.edge_jsonb_bigint(pokemon.value #> '{state,expCap}') <> (select experience_reward
        from public.catalog_species where catalog_release_id = v_battle.catalog_release_id and species_key = participant.species_key)
      or participant.moves <> (select jsonb_agg(jsonb_build_object('move_index', server_authority_private.edge_jsonb_bigint(move.value #> '{data,0}'),
        'display_name', catalog.display_name, 'power', server_authority_private.edge_jsonb_bigint(move.value #> '{data,1}'),
        'stats', server_authority_private.edge_jsonb_bigint(move.value #> '{data,2}')) order by move.ordinality)
        from jsonb_array_elements(pokemon.value -> 'moves') with ordinality move(value, ordinality)
        join public.catalog_move catalog on catalog.catalog_release_id = v_battle.catalog_release_id
          and catalog.move_index = server_authority_private.edge_jsonb_bigint(move.value #> '{data,0}'))
  ) then raise exception 'engine changed canonical player roster/state' using errcode = '22023'; end if;
  if exists (select 1 from public.authoritative_battle_participant participant
    where participant.battle_id = p_battle_id and participant.side = 'player' and not exists (
      select 1 from jsonb_array_elements(p_projection -> 'participants') projected(value)
      where projected.value ->> 'side' = 'player'
        and server_authority_private.edge_jsonb_bigint(projected.value -> 'slot_index') = participant.slot_index
        and projected.value ->> 'species_key' = participant.species_key
        and projected.value ->> 'display_name' = participant.display_name
        and server_authority_private.edge_jsonb_bigint(projected.value -> 'level') = participant.level
        and server_authority_private.edge_jsonb_bigint(projected.value -> 'max_hp') = participant.max_hp
        and server_authority_private.edge_jsonb_bigint(projected.value -> 'current_hp') = participant.current_hp
        and projected.value -> 'type_keys' = participant.type_keys
        and projected.value -> 'moves' = participant.moves
    )) then raise exception 'player projection diverges from canonical pending roster' using errcode = '22023'; end if;

  for v_entry in select value from jsonb_array_elements(p_next_snapshot #> '{enemyTeam,pokemon}') loop
    v_slot := server_authority_private.edge_jsonb_bigint(v_entry #> '{state,authoritativeSlot}');
    if v_slot is null or v_slot not between 0 and v_player_count - 1
      or server_authority_private.edge_jsonb_bigint(v_entry #> '{state,level}') <> v_level
      or server_authority_private.edge_jsonb_bigint(v_entry #> '{state,maxHp}') is null
      or jsonb_typeof(v_entry -> 'moves') is distinct from 'array'
      or jsonb_array_length(v_entry -> 'moves') not between 1 and 4 then
      raise exception 'generated training Pokemon shape is invalid' using errcode = '22023';
    end if;
    select * into v_species from public.catalog_species where catalog_release_id = v_battle.catalog_release_id
      and species_key = v_entry #>> '{state,speciesKey}';
    if not found then raise exception 'generated training species is not cataloged' using errcode = '22023'; end if;
    if exists (select 1 from public.catalog_species species join public.catalog_rarity_rule rarity
      on rarity.catalog_release_id = species.catalog_release_id and rarity.rarity_key = species.encounter_rarity_key
      where species.catalog_release_id = v_battle.catalog_release_id and rarity.encounter_weight > 0
        and v_encounter_level between species.encounter_min_level and species.encounter_max_level) then
      if not exists (select 1 from public.catalog_rarity_rule rarity where rarity.catalog_release_id = v_battle.catalog_release_id
        and rarity.rarity_key = v_species.encounter_rarity_key and rarity.encounter_weight > 0)
        or v_encounter_level not between v_species.encounter_min_level and v_species.encounter_max_level then
        raise exception 'generated training species is encounter-ineligible' using errcode = '22023';
      end if;
    end if;
    if not exists (select 1 from public.catalog_species species join public.catalog_rarity_rule rarity
      on rarity.catalog_release_id = species.catalog_release_id and rarity.rarity_key = species.encounter_rarity_key
      where species.catalog_release_id = v_battle.catalog_release_id and rarity.encounter_weight > 0
        and v_encounter_level between species.encounter_min_level and species.encounter_max_level)
      and exists (select 1 from public.catalog_species species join public.catalog_rarity_rule rarity
        on rarity.catalog_release_id = species.catalog_release_id and rarity.rarity_key = species.encounter_rarity_key
        where species.catalog_release_id = v_battle.catalog_release_id and rarity.encounter_weight > 0)
      and not exists (select 1 from public.catalog_rarity_rule rarity where rarity.catalog_release_id = v_battle.catalog_release_id
        and rarity.rarity_key = v_species.encounter_rarity_key and rarity.encounter_weight > 0) then
      raise exception 'generated fallback training species has zero rarity weight' using errcode = '22023';
    end if;
    select * into strict v_level_rule from public.catalog_level_rule where catalog_release_id = v_battle.catalog_release_id and level = v_level;
    v_generated_hp := server_authority_private.edge_jsonb_bigint(v_entry #> '{state,maxHp}');
    if server_authority_private.catalog_base_hp_for_level(v_battle.catalog_release_id, v_level) is null or server_authority_private.catalog_base_power_for_level(v_battle.catalog_release_id, v_level) is null or server_authority_private.catalog_base_stats_for_level(v_battle.catalog_release_id, v_level) is null
      or v_generated_hp not between server_authority_private.catalog_base_hp_for_level(v_battle.catalog_release_id, v_level) - v_hp_delta and server_authority_private.catalog_base_hp_for_level(v_battle.catalog_release_id, v_level)
      or v_generated_hp > v_level_rule.max_hp then
      raise exception 'generated training HP does not match level rule' using errcode = '22023';
    end if;
    if v_entry #>> '{state,name}' <> v_species.display_name
      or server_authority_private.edge_jsonb_bigint(v_entry #> '{state,ndex}') <> v_species.dex_number
      or coalesce(server_authority_private.edge_jsonb_boolean(v_entry #> '{state,isShiny}'), true)
      or coalesce(server_authority_private.edge_jsonb_boolean(v_entry #> '{state,isMega}'), true)
      or (exists (select 1 from public.catalog_species_gender where catalog_release_id = v_battle.catalog_release_id
          and species_key = v_species.species_key)
        and not exists (select 1 from public.catalog_species_gender where catalog_release_id = v_battle.catalog_release_id
          and species_key = v_species.species_key and gender_key = v_entry #>> '{state,gender}'))
      or (not exists (select 1 from public.catalog_species_gender where catalog_release_id = v_battle.catalog_release_id
          and species_key = v_species.species_key) and v_entry #> '{state,gender}' <> 'null'::jsonb) then
      raise exception 'generated training species identity/gender is invalid' using errcode = '22023';
    end if;
    select jsonb_agg(to_jsonb(type_key) order by type_order) into v_types from public.catalog_species_type
      where catalog_release_id = v_battle.catalog_release_id and species_key = v_species.species_key;
    if v_entry #> '{state,type}' <> v_types then raise exception 'generated training types are invalid' using errcode = '22023'; end if;
    select jsonb_agg(jsonb_build_object('move_index', server_authority_private.edge_jsonb_bigint(move.value #> '{data,0}'),
      'display_name', catalog.display_name, 'power', server_authority_private.edge_jsonb_bigint(move.value #> '{data,1}'),
      'stats', server_authority_private.edge_jsonb_bigint(move.value #> '{data,2}')) order by move.ordinality) into v_moves
    from jsonb_array_elements(v_entry -> 'moves') with ordinality move(value, ordinality)
    join public.catalog_move catalog on catalog.catalog_release_id = v_battle.catalog_release_id
      and catalog.move_index = server_authority_private.edge_jsonb_bigint(move.value #> '{data,0}')
    where server_authority_private.edge_jsonb_bigint(move.value #> '{data,1}') between server_authority_private.catalog_base_power_for_level(v_battle.catalog_release_id, v_level) - v_power_delta and server_authority_private.catalog_base_power_for_level(v_battle.catalog_release_id, v_level)
      and server_authority_private.edge_jsonb_bigint(move.value #> '{data,2}') between server_authority_private.catalog_base_stats_for_level(v_battle.catalog_release_id, v_level) - v_stats_delta and server_authority_private.catalog_base_stats_for_level(v_battle.catalog_release_id, v_level)
      and server_authority_private.edge_jsonb_bigint(move.value #> '{data,1}') <= v_level_rule.max_power
      and server_authority_private.edge_jsonb_bigint(move.value #> '{data,2}') <= v_level_rule.max_stats
      and exists (select 1 from public.catalog_species_level_move learned where learned.catalog_release_id = v_battle.catalog_release_id
        and learned.species_key = v_species.species_key and learned.level <= v_level
        and learned.move_index = server_authority_private.edge_jsonb_bigint(move.value #> '{data,0}'));
    if coalesce(jsonb_array_length(v_moves), 0) <> jsonb_array_length(v_entry -> 'moves') then
      raise exception 'generated training moves are invalid' using errcode = '22023';
    end if;
    if not exists (select 1 from jsonb_array_elements(p_projection -> 'participants') projected(value)
      where projected.value ->> 'side' = 'npc'
        and server_authority_private.edge_jsonb_bigint(projected.value -> 'slot_index') = v_slot
        and projected.value ->> 'species_key' = v_species.species_key
        and projected.value ->> 'display_name' = v_species.display_name
        and server_authority_private.edge_jsonb_bigint(projected.value -> 'level') = v_level
        and server_authority_private.edge_jsonb_bigint(projected.value -> 'max_hp') = v_generated_hp
        and server_authority_private.edge_jsonb_bigint(projected.value -> 'current_hp') = v_generated_hp
        and projected.value -> 'type_keys' = v_types and projected.value -> 'moves' = v_moves) then
      raise exception 'generated training projection diverges from snapshot' using errcode = '22023';
    end if;
    insert into public.authoritative_battle_participant(battle_id, side, slot_index, pokemon_instance_id,
      species_key, display_name, level, max_hp, current_hp, type_keys, moves, source_snapshot)
    values (p_battle_id, 'npc', v_slot, null, v_species.species_key, v_species.display_name, v_level,
      v_generated_hp, v_generated_hp, v_types, v_moves,
      jsonb_build_object('source', 'edge_training', 'species_key', v_species.species_key, 'level', v_level));
  end loop;
  if (select count(distinct slot_index) from public.authoritative_battle_participant where battle_id = p_battle_id and side = 'npc') <> v_player_count then
    raise exception 'generated training slots are not unique/complete' using errcode = '22023';
  end if;
  update public.authoritative_battle set presentation = v_presentation where id = p_battle_id;
end;
$$;

CREATE OR REPLACE FUNCTION "server_authority_private"."apply_mission_fact"("p_auth_user_id" "uuid", "p_event_type" "text", "p_event_data" "jsonb", "p_occurred_at" timestamp with time zone) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'pg_temp'
    AS $$
declare
  v_mission record; v_event_data jsonb:=coalesce(p_event_data,'{}'::jsonb);
  v_amount integer; v_distinct_key text; v_event_day date;
  v_today date:=(now() at time zone 'Europe/Rome')::date;
begin
  if p_occurred_at is null or jsonb_typeof(v_event_data)<>'object' then
    raise exception 'mission event data and occurrence time are required' using errcode='22023';
  end if;
  v_event_day:=(p_occurred_at at time zone 'Europe/Rome')::date;
  if v_event_day>v_today then return; end if;
  perform server_authority_private.sync_player_missions(p_auth_user_id);
  for v_mission in
    select state.*,mission.mission_type,mission.target,mission.rules
    from public.player_mission_state state join public.catalog_mission mission
      on mission.catalog_release_id=state.catalog_release_id and mission.mission_index=state.mission_index
    where state.auth_user_id=p_auth_user_id and state.claim_status='unclaimed' and state.counter<mission.target
      and server_authority_private.mission_is_active(p_auth_user_id,state.mission_index)
      and (not coalesce((mission.rules->>'daily')::boolean,false) or v_event_day=v_today)
      and (
        (p_event_type='pokemon_captured' and (mission.mission_type='zone_captures'
          or (mission.mission_type='zone_captures_after_badge'
            and coalesce((v_event_data->>'badges')::integer,0)>=coalesce((mission.rules->>'minBadges')::integer,0))))
        or (p_event_type='berries_harvested' and mission.mission_type='berries_harvested')
        or (p_event_type='held_item_assigned' and mission.mission_type='held_item_assigned')
        or (p_event_type='pokemon_level_up' and mission.mission_type='distinct_species_level_up')
        or (p_event_type='pokemon_evolved' and mission.mission_type='distinct_species_evolved')
        or (p_event_type='daycare_cycle_completed' and mission.mission_type='daycare_cycle_completed')
        or (p_event_type='training_victory' and mission.mission_type in ('training_victory','training_difficulties')
          and (not (mission.rules?'difficulty') or mission.rules->>'difficulty'=v_event_data->>'difficulty')
          and (not (mission.rules?'difficulties') or mission.rules->'difficulties'?(v_event_data->>'difficulty'))
          and coalesce((v_event_data->>'teamSizeAtStart')::integer,0)>=coalesce((mission.rules->>'minTeamSize')::integer,0))
      )
    order by state.mission_index for update of state
  loop
    v_amount:=case when p_event_type='berries_harvested'
      then greatest(1,coalesce((v_event_data->>'quantity')::integer,1)) else 1 end;
    v_distinct_key:=case
      when v_mission.mission_type in ('distinct_species_level_up','distinct_species_evolved')
        then nullif(v_event_data->>'speciesKey','')
      when v_mission.mission_type='training_difficulties'
        then 'difficulty:'||nullif(v_event_data->>'difficulty','') else null end;
    if coalesce((v_mission.rules->>'distinctDays')::boolean,false) then
      v_distinct_key:='day:'||v_event_day::text;
    end if;
    if v_distinct_key is not null and v_distinct_key=any(v_mission.tracked_keys) then continue; end if;
    update public.player_mission_state set counter=least(v_mission.target,counter+v_amount),
      tracked_keys=case when v_distinct_key is null then tracked_keys else array_append(tracked_keys,v_distinct_key) end,
      last_counted_day=case when coalesce((v_mission.rules->>'distinctDays')::boolean,false)
        then v_event_day else last_counted_day end,updated_at=p_occurred_at
    where auth_user_id=p_auth_user_id and mission_index=v_mission.mission_index;
  end loop;
end;
$$;

CREATE OR REPLACE FUNCTION "server_authority_private"."assert_team_within_badge_level_cap"("p_auth_user_id" "uuid", "p_command_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'pg_temp'
    AS $$
declare v_catalog uuid; v_badges integer; v_level_limit integer;
begin
  if exists(select 1 from public.player_command_receipt where auth_user_id=p_auth_user_id and command_id=p_command_id) then
    return;
  end if;
  select catalog_release_id,least(8,greatest(0,badges)) into strict v_catalog,v_badges
  from public.player_profile_state where auth_user_id=p_auth_user_id;
  select (rules->>'level')::integer into strict v_level_limit
  from public.catalog_progression_rule
  where catalog_release_id=v_catalog and rule_family='badge_level_limit' and rule_key=v_badges::text;
  if v_level_limit not between 1 and 100 then
    raise exception 'Il limite di livello del catalogo per le medaglie non Ã¨ valido.' using errcode='0A000';
  end if;
  if exists(
    select 1 from public.player_pokemon_placement placement
    join public.player_pokemon_instance pokemon on pokemon.id=placement.pokemon_instance_id
    where placement.auth_user_id=p_auth_user_id and placement.placement_type='team'
      and coalesce(server_authority_private.edge_jsonb_bigint(pokemon.state->'l'),101)>v_level_limit
  ) then
    raise exception 'La squadra contiene un Pokemon di livello superiore al limite consentito dalle medaglie.' using errcode='22023';
  end if;
end;
$$;

CREATE OR REPLACE FUNCTION "server_authority_private"."authoritative_battle_apply_azione"("p_battle_id" "uuid", "p_attacker_side" "text", "p_move_slot" integer) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'pg_temp'
    AS $$
declare
  v_battle public.authoritative_battle%rowtype;
  v_attacker public.authoritative_battle_participant%rowtype;
  v_defender public.authoritative_battle_participant%rowtype;
  v_move jsonb;
  v_multiplier numeric;
  v_damage integer;
  v_hp_after integer;
  v_defender_side text := case when p_attacker_side = 'player' then 'npc' else 'player' end;
begin
  if p_attacker_side not in ('player', 'npc') then
    raise exception 'battle action side is invalid' using errcode = '22023';
  end if;
  select * into strict v_battle from public.authoritative_battle where id = p_battle_id;
  select * into strict v_attacker
  from public.authoritative_battle_participant
  where battle_id = p_battle_id and side = p_attacker_side
    and slot_index = case when p_attacker_side = 'player' then v_battle.player_active_slot else v_battle.npc_active_slot end;
  select * into strict v_defender
  from public.authoritative_battle_participant
  where battle_id = p_battle_id and side = v_defender_side
    and slot_index = case when v_defender_side = 'player' then v_battle.player_active_slot else v_battle.npc_active_slot end;

  if v_attacker.current_hp <= 0 or v_defender.current_hp <= 0 then
    raise exception 'a fainted participant cannot resolve an action' using errcode = '22023';
  end if;
  if p_move_slot is null or p_move_slot < 0 or p_move_slot >= jsonb_array_length(v_attacker.moves) then
    raise exception 'move slot is not available' using errcode = '22023';
  end if;
  v_move := v_attacker.moves -> p_move_slot;
  if (v_move ->> 'move_index')::integer <> 25 or v_move ->> 'rules_contract' <> 'simple_damage' then
    raise exception 'move is unsupported by authoritative battle v1' using errcode = '0A000';
  end if;

  -- Engine parity: the attacker's Pokemon types drive effectiveness (not the
  -- move type), there is no STAB, and this slice has no stat/held/weather mods.
  v_multiplier := server_authority_private.authoritative_battle_type_multiplier(
    v_battle.catalog_release_id, v_attacker.type_keys, v_defender.type_keys
  );
  v_damage := greatest(1, floor((v_move ->> 'power')::integer * v_multiplier)::integer);
  v_hp_after := greatest(0, v_defender.current_hp - v_damage);
  update public.authoritative_battle_participant
  set current_hp = v_hp_after
  where battle_id = p_battle_id and side = v_defender.side and slot_index = v_defender.slot_index;

  perform server_authority_private.authoritative_battle_append_event(
    p_battle_id,
    'move_resolved',
    jsonb_build_object(
      'turn_number', v_battle.turn_number,
      'attacker_side', p_attacker_side,
      'attacker_slot', v_attacker.slot_index,
      'defender_side', v_defender.side,
      'defender_slot', v_defender.slot_index,
      'move_slot', p_move_slot,
      'move_index', 25,
      'move_name', 'tackle',
      'power', (v_move ->> 'power')::integer,
      'attacker_types', v_attacker.type_keys,
      'type_multiplier', v_multiplier,
      'damage', v_damage,
      'hp_before', v_defender.current_hp,
      'hp_after', v_hp_after,
      'ko', v_hp_after = 0
    )
  );
  return jsonb_build_object('defender_side', v_defender.side, 'defender_slot', v_defender.slot_index,
    'damage', v_damage, 'hp_after', v_hp_after, 'ko', v_hp_after = 0);
end;
$$;

CREATE OR REPLACE FUNCTION "server_authority_private"."battle_shop_offers_projection"("p_auth_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'pg_temp'
    AS $$
declare v_catalog_release_id uuid; v_badges integer; v_level integer;
begin
  select catalog_release_id,badges into v_catalog_release_id,v_badges
  from public.player_profile_state where auth_user_id=p_auth_user_id;
  if v_catalog_release_id is null then return '[]'::jsonb; end if;
  select (rules->>'level')::integer into v_level from public.catalog_progression_rule
  where catalog_release_id=v_catalog_release_id and rule_family='badge_level_limit'
    and rule_key=least(8,greatest(0,coalesce(v_badges,0)))::text;
  return coalesce((
    select jsonb_agg(row_json order by sort_order,stable_order) from (
      select offer.sort_order,offer.offer_key stable_order,
        jsonb_build_object('offer_key',offer.offer_key,'offer_kind','item','item_index',offer.item_index,
          'battle_point_price',offer.battle_point_price,'eligible',true) row_json
      from public.catalog_battle_shop_offer offer
      where offer.catalog_release_id=v_catalog_release_id and offer.offer_kind='item'
        and coalesce(offer.rules->>'group','') not in ('Bacca a crescita veloce','Bacca a crescita lenta','tms',
          'Strumenti evolutivi','Aromi','Strumenti potenziatore Tipo')
      union all
      select min(offer.sort_order),choice_key,
        jsonb_build_object('offer_key',choice_key,'offer_kind','item_choice',
          'battle_point_price',min(offer.battle_point_price),'eligible',count(*)>0,
          'choices',jsonb_agg(jsonb_build_object('offer_key',offer.offer_key,'item_index',item.item_index)
            order by item.item_index)) row_json
      from (
        select offer.*,case offer.rules->>'group'
          when 'Bacca a crescita veloce' then 'choice_berry_fast'
          when 'Bacca a crescita lenta' then 'choice_berry_slow'
          when 'tms' then 'choice_tm'
          when 'Strumenti evolutivi' then 'choice_evolution'
          when 'Aromi' then 'choice_incense'
          else 'choice_type_booster' end choice_key,
          offer.rules->>'group' group_name
        from public.catalog_battle_shop_offer offer
        where offer.catalog_release_id=v_catalog_release_id and offer.offer_kind='item'
          and coalesce(offer.rules->>'group','') in ('Bacca a crescita veloce','Bacca a crescita lenta','tms',
            'Strumenti evolutivi','Aromi','Strumenti potenziatore Tipo')
      ) offer
      join public.catalog_item item on item.catalog_release_id=offer.catalog_release_id and item.item_index=offer.item_index
      where offer.group_name<>'tms' or v_badges>=case coalesce((item.rules->>'tier')::integer,3)
        when 0 then 7 when 1 then 6 when 2 then 4 else 0 end
      group by group_name,choice_key
      union all
      select offer.sort_order,offer.offer_key,
        jsonb_build_object('offer_key',offer.offer_key,'offer_kind','pokemon_choice',
          'battle_point_price',offer.battle_point_price,'eligible',true,
          'choices',jsonb_agg(jsonb_build_object('offer_key',offer.offer_key||':'||species.species_key,
            'species_key',species.species_key,'level',v_level) order by species.species_key)) row_json
      from public.catalog_battle_shop_offer offer
      join lateral server_authority_private.battle_shop_pokemon_candidates(
        v_catalog_release_id,offer.offer_key,v_level) candidate on true
      join public.catalog_species species on species.catalog_release_id=v_catalog_release_id
        and species.species_key=candidate.species_key
      where offer.catalog_release_id=v_catalog_release_id and offer.offer_kind='pokemon'
      group by offer.offer_key,offer.sort_order,offer.battle_point_price
    ) offers
  ),'[]'::jsonb);
end;
$$;

CREATE OR REPLACE FUNCTION "server_authority_private"."battle_shop_pokemon_candidates"("p_catalog_release_id" "uuid", "p_pool_key" "text", "p_level" integer) RETURNS TABLE("species_key" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'pg_temp'
    AS $$
  with recursive lineage(root_species_key, species_key, minimum_level) as (
    select species.species_key, species.species_key, 5
    from public.catalog_species species where species.catalog_release_id=p_catalog_release_id
    union all
    select lineage.root_species_key, evolution.species_key,
      greatest(lineage.minimum_level, case when evolution.trigger_key='level'
        then coalesce((evolution.trigger_rules->>'level')::integer, 101)
        else coalesce(parent.encounter_min_level, 5) end)
    from lineage
    join public.catalog_species_evolution evolution on evolution.catalog_release_id=p_catalog_release_id
      and evolution.target_species_key=lineage.species_key
    join public.catalog_species parent on parent.catalog_release_id=p_catalog_release_id
      and parent.species_key=evolution.species_key
  ), minimums as (
    select root_species_key, max(minimum_level) as minimum_level from lineage group by root_species_key
  )
  select species.species_key
  from public.catalog_battle_shop_offer offer
  join public.catalog_species species on species.catalog_release_id=offer.catalog_release_id
  join minimums on minimums.root_species_key=species.species_key
  where offer.catalog_release_id=p_catalog_release_id and offer.offer_key=p_pool_key and offer.offer_kind='pokemon'
    and p_level between 5 and 100 and minimums.minimum_level<=p_level
    and species.encounter_rarity_key<>'legendary'
    and (coalesce((offer.rules->>'excludeFossils')::boolean,false)=false or species.encounter_rarity_key<>'fossil');
$$;

CREATE OR REPLACE FUNCTION "server_authority_private"."capture_battle_inventory"("p_auth_user_id" "uuid", "p_catalog_release_id" "uuid") RETURNS "jsonb"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'pg_temp'
    AS $$
  select coalesce(jsonb_agg(jsonb_build_array(i.item_index,i.quantity) order by i.item_index),'[]'::jsonb)
  from public.player_inventory_item i join public.catalog_item c
    on c.catalog_release_id=i.catalog_release_id and c.item_index=i.item_index
  where i.auth_user_id=p_auth_user_id and i.catalog_release_id=p_catalog_release_id and i.quantity>0
    and (c.category_key='ball' or c.category_key='battle_item'
      or (c.category_key='berry' and c.item_index between 300 and 308));
$$;

CREATE OR REPLACE FUNCTION "server_authority_private"."commit_edge_battle_command_before_gyms"("p_auth_user_id" "uuid", "p_command_id" "uuid", "p_command_type" "text", "p_command_hash" "text", "p_expected_player_revision" bigint, "p_battle_id" "uuid", "p_expected_battle_version" bigint, "p_runtime_owner_id" "uuid", "p_engine_version" "text", "p_engine_checksum" "text", "p_input_snapshot_hash" "text", "p_next_snapshot" "jsonb", "p_events" "jsonb", "p_projection" "jsonb", "p_terminal_effects" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'extensions', 'pg_temp'
    AS $$
declare
  v_battle public.authoritative_battle%rowtype;
  v_receipt public.authoritative_battle_command_receipt%rowtype;
  v_player_receipt public.player_command_receipt%rowtype;
  v_revision bigint;
  v_current_hash text;
  v_expected_items jsonb;
  v_inventory_effect jsonb;
  v_item public.catalog_item%rowtype;
  v_item_index integer;
  v_before integer;
  v_after integer;
  v_db_quantity integer;
  v_prior_uses integer;
  v_snapshot_uses integer;
  v_next_uses integer;
  v_consumed boolean;
  v_result jsonb;
  v_player jsonb;
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_auth_user_id::text || ':' || p_command_id::text, 0));
  select * into v_receipt from public.authoritative_battle_command_receipt
    where auth_user_id = p_auth_user_id and command_id = p_command_id;
  if found then
    if v_receipt.battle_id <> p_battle_id or v_receipt.command_type <> p_command_type
      or v_receipt.command_hash <> p_command_hash then
      raise exception 'command id was already used with a different payload' using errcode = '22023';
    end if;
    return v_receipt.result;
  end if;

  if p_command_type = 'initialize' then
    select * into strict v_battle from public.authoritative_battle
      where id = p_battle_id and auth_user_id = p_auth_user_id;
    if v_battle.contract_key in ('training','gym','admin_gym','league','debug_training') then
      v_expected_items := server_authority_private.training_battle_inventory(p_auth_user_id, v_battle.catalog_release_id);
      if p_next_snapshot -> 'playerItems' is distinct from v_expected_items
        or p_projection -> 'player_items' is distinct from v_expected_items then
        raise exception 'training initialization inventory is not canonical' using errcode = '22023';
      end if;
    end if;
  end if;

  if p_command_type <> 'item' then
    return server_authority_private.commit_edge_battle_command_without_items(
      p_auth_user_id,p_command_id,p_command_type,p_command_hash,p_expected_player_revision,
      p_battle_id,p_expected_battle_version,p_runtime_owner_id,p_engine_version,p_engine_checksum,
      p_input_snapshot_hash,p_next_snapshot,p_events,p_projection,p_terminal_effects);
  end if;

  -- Reject stale/foreign commands before locking or changing inventory. The
  -- wrapped commit repeats these checks immediately before snapshot adoption.
  select revision into v_revision from public.player_state_revision
    where auth_user_id = p_auth_user_id for update;
  if not found then raise exception 'player state does not exist' using errcode = 'P0002'; end if;
  select * into v_battle from public.authoritative_battle
    where id = p_battle_id and auth_user_id = p_auth_user_id for update;
  if not found then raise exception 'authoritative battle was not found' using errcode = 'P0002'; end if;
  if v_revision <> p_expected_player_revision or v_battle.battle_version <> p_expected_battle_version
    or v_battle.engine_runtime_state <> 'ready'
    or v_battle.engine_version is distinct from p_engine_version
    or v_battle.engine_checksum is distinct from p_engine_checksum then
    raise exception 'battle item revision/version conflict' using errcode = '40001';
  end if;
  if v_battle.runtime_owner_id <> p_runtime_owner_id then
    raise exception 'runtime lock is owned by another client' using errcode = '55P03';
  end if;
  if v_battle.status <> 'active' or v_battle.contract_key not in ('training','gym','admin_gym','league','debug_training')
    or coalesce(server_authority_private.edge_jsonb_boolean(v_battle.engine_snapshot #> '{manager,playerNeedsSwitch}'),false)
    or coalesce(server_authority_private.edge_jsonb_boolean(v_battle.engine_snapshot #> '{manager,playerPostMoveSwitch}'),false) then
    raise exception 'battle contract does not accept persistent items' using errcode = '22023';
  end if;
  v_current_hash := server_authority_private.prepare_edge_battle_command_core(p_auth_user_id,p_battle_id)->>'input_snapshot_hash';
  if v_current_hash <> p_input_snapshot_hash then
    raise exception 'engine snapshot/version conflict' using errcode = '40001';
  end if;

  if p_events #>> '{0,type}' <> 'command_resolved'
    or p_events #>> '{0,data,command_type}' <> 'item'
    or server_authority_private.edge_jsonb_bigint(p_events #> '{0,data,item_index}') is null
    or server_authority_private.edge_jsonb_boolean(p_events #> '{0,data,item_consumed}') is null
    or server_authority_private.edge_jsonb_boolean(p_events #> '{0,data,action_skipped}') is null then
    raise exception 'battle item journal fact is invalid' using errcode = '22023';
  end if;
  v_item_index := server_authority_private.edge_jsonb_bigint(p_events #> '{0,data,item_index}');

  if jsonb_typeof(p_terminal_effects) is distinct from 'object'
    or p_terminal_effects - array['reward','inventory','team'] <> '{}'::jsonb
    or p_terminal_effects ->> 'reward' <> 'none' or p_terminal_effects ->> 'team' <> 'unchanged' then
    raise exception 'battle item consumption descriptor is invalid' using errcode = '22023';
  end if;
  v_inventory_effect := p_terminal_effects -> 'inventory';
  v_consumed := jsonb_typeof(v_inventory_effect) = 'object';
  if v_consumed then
    if v_inventory_effect - array['kind','itemIndex','quantity','beforeQuantity','afterQuantity'] <> '{}'::jsonb
      or v_inventory_effect ->> 'kind' <> 'battle_item_consumption'
      or server_authority_private.edge_jsonb_bigint(v_inventory_effect -> 'quantity') <> 1
      or server_authority_private.edge_jsonb_bigint(v_inventory_effect -> 'itemIndex') <> v_item_index
      or not server_authority_private.edge_jsonb_boolean(p_events #> '{0,data,item_consumed}')
      or server_authority_private.edge_jsonb_boolean(p_events #> '{0,data,action_skipped}') then
      raise exception 'exactly one battle item must be consumed' using errcode = '22023';
    end if;
    v_before := server_authority_private.edge_jsonb_bigint(v_inventory_effect -> 'beforeQuantity');
    v_after := server_authority_private.edge_jsonb_bigint(v_inventory_effect -> 'afterQuantity');
    if coalesce(v_before,0) <= 0 or v_after <> v_before - 1 then
      raise exception 'battle item quantity delta is invalid' using errcode = '22023';
    end if;
  elsif v_inventory_effect is distinct from to_jsonb('unchanged'::text)
    or server_authority_private.edge_jsonb_boolean(p_events #> '{0,data,item_consumed}')
    or not server_authority_private.edge_jsonb_boolean(p_events #> '{0,data,action_skipped}') then
    raise exception 'non-consumed battle item transition is invalid' using errcode = '22023';
  end if;
  select * into v_item from public.catalog_item where catalog_release_id = v_battle.catalog_release_id
    and item_index = v_item_index;
  if not found or not (
      (v_item.category_key = 'battle_item' and v_item.subcategory_key in ('heal_hp','heal_full','heal_ko','heal_status','weather'))
      or (v_item.category_key = 'berry' and v_item.item_index between 300 and 308
        and v_item.subcategory_key in ('heal_hp','heal_status'))
    ) then
    raise exception 'catalog item is not supported for authoritative training' using errcode = '22023';
  end if;

  if jsonb_typeof(v_battle.engine_snapshot -> 'playerItems') is distinct from 'array'
    or jsonb_typeof(p_next_snapshot -> 'playerItems') is distinct from 'array'
    or jsonb_typeof(p_projection -> 'player_items') is distinct from 'array'
    or p_projection -> 'player_items' is distinct from p_next_snapshot -> 'playerItems'
    or exists (select 1 from jsonb_array_elements(v_battle.engine_snapshot -> 'playerItems') entry(value)
      where jsonb_typeof(value) <> 'array' or jsonb_array_length(value) <> 2
        or server_authority_private.edge_jsonb_bigint(value -> 0) is null
        or coalesce(server_authority_private.edge_jsonb_bigint(value -> 1),-1) < 0)
    or exists (select 1 from jsonb_array_elements(p_next_snapshot -> 'playerItems') entry(value)
      where jsonb_typeof(value) <> 'array' or jsonb_array_length(value) <> 2
        or server_authority_private.edge_jsonb_bigint(value -> 0) is null
        or coalesce(server_authority_private.edge_jsonb_bigint(value -> 1),-1) < 0)
    or (select count(*) from jsonb_array_elements(v_battle.engine_snapshot -> 'playerItems')) <>
       (select count(distinct server_authority_private.edge_jsonb_bigint(value -> 0)) from jsonb_array_elements(v_battle.engine_snapshot -> 'playerItems'))
    or (select count(*) from jsonb_array_elements(p_next_snapshot -> 'playerItems')) <>
       (select count(distinct server_authority_private.edge_jsonb_bigint(value -> 0)) from jsonb_array_elements(p_next_snapshot -> 'playerItems')) then
    raise exception 'battle-local inventory snapshot is invalid' using errcode = '22023';
  end if;
  select server_authority_private.edge_jsonb_bigint(value -> 1) into v_snapshot_uses
    from jsonb_array_elements(v_battle.engine_snapshot -> 'playerItems') where server_authority_private.edge_jsonb_bigint(value -> 0)=v_item_index;
  select server_authority_private.edge_jsonb_bigint(value -> 1) into v_next_uses
    from jsonb_array_elements(p_next_snapshot -> 'playerItems') where server_authority_private.edge_jsonb_bigint(value -> 0)=v_item_index;
  if p_projection -> 'weather' is distinct from p_next_snapshot #> '{manager,weather}'
    or p_projection -> 'weather_move_used_last_action' is distinct from p_next_snapshot #> '{manager,weatherMoveUsedLastAction}' then
    raise exception 'battle weather projection diverges from the trusted snapshot' using errcode='22023';
  end if;
  if v_consumed then
    if v_snapshot_uses is distinct from v_before or v_next_uses is distinct from v_after
      or exists (
        select 1 from jsonb_array_elements(v_battle.engine_snapshot -> 'playerItems') old_entry(value)
        full join jsonb_array_elements(p_next_snapshot -> 'playerItems') new_entry(value)
          on server_authority_private.edge_jsonb_bigint(old_entry.value -> 0)=server_authority_private.edge_jsonb_bigint(new_entry.value -> 0)
        where coalesce(server_authority_private.edge_jsonb_bigint(old_entry.value -> 0),server_authority_private.edge_jsonb_bigint(new_entry.value -> 0))<>v_item_index
          and old_entry.value is distinct from new_entry.value
      ) then raise exception 'battle-local inventory changed outside the trusted consumption' using errcode = '22023'; end if;
  elsif coalesce(v_snapshot_uses,0) <= 0 or v_next_uses is distinct from v_snapshot_uses
    or p_next_snapshot -> 'playerItems' is distinct from v_battle.engine_snapshot -> 'playerItems' then
    raise exception 'skipped battle item changed battle-local inventory' using errcode='22023';
  end if;
  if not v_consumed then v_before:=v_snapshot_uses; v_after:=v_next_uses; end if;

  if exists (
    with snapshot_combatants as (
      select 'player'::text side,
        server_authority_private.edge_jsonb_bigint(pokemon.value #> '{state,authoritativeSlot}') slot,
        combatant.value #> '{state,status}' status,
        coalesce(server_authority_private.edge_jsonb_bigint(combatant.value #> '{state,sleepCounter}'),0) sleep_counter,
        coalesce(server_authority_private.edge_jsonb_bigint(combatant.value #> '{state,sleepDuration}'),0) sleep_duration,
        coalesce(server_authority_private.edge_jsonb_bigint(combatant.value #> '{state,confCounter}'),0) confusion_counter
      from jsonb_array_elements(p_next_snapshot #> '{playerTeam,pokemon}') with ordinality pokemon(value,ordinality)
      join jsonb_array_elements(p_next_snapshot #> '{playerTeam,combatants}') with ordinality combatant(value,ordinality) using(ordinality)
      union all
      select 'npc'::text,
        server_authority_private.edge_jsonb_bigint(pokemon.value #> '{state,authoritativeSlot}'),
        combatant.value #> '{state,status}',
        coalesce(server_authority_private.edge_jsonb_bigint(combatant.value #> '{state,sleepCounter}'),0),
        coalesce(server_authority_private.edge_jsonb_bigint(combatant.value #> '{state,sleepDuration}'),0),
        coalesce(server_authority_private.edge_jsonb_bigint(combatant.value #> '{state,confCounter}'),0)
      from jsonb_array_elements(p_next_snapshot #> '{enemyTeam,pokemon}') with ordinality pokemon(value,ordinality)
      join jsonb_array_elements(p_next_snapshot #> '{enemyTeam,combatants}') with ordinality combatant(value,ordinality) using(ordinality)
    )
    select 1 from snapshot_combatants snapshot
    left join jsonb_array_elements(p_projection -> 'participants') projected(value)
      on projected.value->>'side'=snapshot.side
      and server_authority_private.edge_jsonb_bigint(projected.value->'slot_index')=snapshot.slot
    where projected.value is null or projected.value->'status' is distinct from snapshot.status
      or server_authority_private.edge_jsonb_bigint(projected.value->'sleep_counter')<>snapshot.sleep_counter
      or server_authority_private.edge_jsonb_bigint(projected.value->'sleep_duration')<>snapshot.sleep_duration
      or server_authority_private.edge_jsonb_bigint(projected.value->'confusion_counter')<>snapshot.confusion_counter
  ) then raise exception 'battle HP/status projection diverges from the trusted snapshot' using errcode='22023'; end if;

  select count(*) into v_prior_uses from public.authoritative_battle_event event
    where event.battle_id=p_battle_id and event.event_type='command_resolved'
      and event.event_data->>'command_type'='item'
      and coalesce(server_authority_private.edge_jsonb_boolean(event.event_data->'item_consumed'),false)
      and server_authority_private.edge_jsonb_bigint(event.event_data->'item_index')=v_item_index;
  v_snapshot_uses := coalesce(server_authority_private.edge_jsonb_bigint(v_battle.engine_snapshot #> array['manager','usedItems',v_item.display_name]),0);
  v_next_uses := coalesce(server_authority_private.edge_jsonb_bigint(p_next_snapshot #> array['manager','usedItems',v_item.display_name]),0);
  if v_snapshot_uses <> v_prior_uses or v_snapshot_uses >= 3
    or (v_consumed and v_next_uses <> v_prior_uses + 1)
    or (not v_consumed and v_next_uses <> v_prior_uses)
    or (v_consumed and (v_battle.engine_snapshot #> '{manager,usedItems}') - v_item.display_name
      is distinct from (p_next_snapshot #> '{manager,usedItems}') - v_item.display_name)
    or (not v_consumed and v_battle.engine_snapshot #> '{manager,usedItems}'
      is distinct from p_next_snapshot #> '{manager,usedItems}')
    or p_projection -> 'used_items' is distinct from p_next_snapshot #> '{manager,usedItems}' then
    raise exception 'battle item use count or journal fact is invalid' using errcode = '22023';
  end if;

  select quantity into v_db_quantity from public.player_inventory_item
    where auth_user_id=p_auth_user_id and catalog_release_id=v_battle.catalog_release_id
      and item_index=v_item_index for update;
  if not found or v_db_quantity <> v_before then
    raise exception 'canonical battle item quantity is insufficient or stale' using errcode = '40001';
  end if;
  if not v_consumed then
    v_result := server_authority_private.commit_edge_battle_command_without_items(
      p_auth_user_id,p_command_id,p_command_type,p_command_hash,p_expected_player_revision,
      p_battle_id,p_expected_battle_version,p_runtime_owner_id,p_engine_version,p_engine_checksum,
      p_input_snapshot_hash,p_next_snapshot,p_events,p_projection,
      jsonb_build_object('reward','none','inventory','unchanged','team','unchanged'));
    return v_result;
  end if;
  update public.player_inventory_item set quantity=quantity-1,updated_at=now()
    where auth_user_id=p_auth_user_id and item_index=v_item_index;
  delete from public.player_inventory_item where auth_user_id=p_auth_user_id
    and item_index=v_item_index and quantity=0;

  v_result := server_authority_private.commit_edge_battle_command_without_items(
    p_auth_user_id,p_command_id,p_command_type,p_command_hash,p_expected_player_revision,
    p_battle_id,p_expected_battle_version,p_runtime_owner_id,p_engine_version,p_engine_checksum,
    p_input_snapshot_hash,p_next_snapshot,p_events,p_projection,
    jsonb_build_object('reward','none','inventory','unchanged','team','unchanged'));
  v_player := server_authority_private.player_state_projection(p_auth_user_id);
  v_result := v_result || jsonb_build_object('player_state',v_player);
  update public.authoritative_battle_command_receipt set result=v_result,
    resulting_player_revision=(v_result->>'player_revision')::bigint
    where auth_user_id=p_auth_user_id and command_id=p_command_id;

  insert into public.player_command_receipt(auth_user_id,command_id,command_type,request_hash,result,resulting_revision)
  values(p_auth_user_id,p_command_id,'authoritative_battle_item',p_command_hash,
    jsonb_build_object('item_index',v_item_index,'battle_id',p_battle_id),
    (v_result->>'player_revision')::bigint) returning * into v_player_receipt;
  perform server_authority_private.apply_mission_fact(v_player_receipt.auth_user_id,'battle-item-used',
    jsonb_build_object('itemIndex',v_item_index,'battleId',p_battle_id,'contract','training'),v_player_receipt.created_at);
  v_player := server_authority_private.player_state_projection(p_auth_user_id);
  v_result := v_result || jsonb_build_object('player_state',v_player);
  update public.authoritative_battle_command_receipt set result=v_result
    where auth_user_id=p_auth_user_id and command_id=p_command_id;
  update public.player_command_receipt set result=jsonb_build_object(
    'item_index',v_item_index,'battle_id',p_battle_id,'player_state',v_player)
    where auth_user_id=p_auth_user_id and command_id=p_command_id;
  return v_result;
end;
$$;

CREATE OR REPLACE FUNCTION "server_authority_private"."commit_edge_battle_command_before_held_item_state_repair"("p_auth_user_id" "uuid", "p_command_id" "uuid", "p_command_type" "text", "p_command_hash" "text", "p_expected_player_revision" bigint, "p_battle_id" "uuid", "p_expected_battle_version" bigint, "p_runtime_owner_id" "uuid", "p_engine_version" "text", "p_engine_checksum" "text", "p_input_snapshot_hash" "text", "p_next_snapshot" "jsonb", "p_events" "jsonb", "p_projection" "jsonb", "p_terminal_effects" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'extensions', 'pg_temp'
    AS $_$
declare v_battle public.authoritative_battle%rowtype; v_receipt public.authoritative_battle_command_receipt%rowtype;
  v_item public.catalog_item%rowtype; v_index integer; v_before integer; v_after integer; v_db integer;
  v_consumed boolean; v_success boolean; v_result jsonb; v_core_projection jsonb; v_revision bigint; v_player_receipt public.player_command_receipt%rowtype;
  v_rate numeric; v_expected_rate numeric;
begin
  if coalesce(auth.role(),'')<>'service_role' then raise exception 'service role required' using errcode='42501'; end if;
  select * into v_battle from public.authoritative_battle where id=p_battle_id and auth_user_id=p_auth_user_id;
  if not found or v_battle.contract_key<>'capture' then
    return server_authority_private.commit_edge_battle_command_before_capture(p_auth_user_id,p_command_id,p_command_type,p_command_hash,
      p_expected_player_revision,p_battle_id,p_expected_battle_version,p_runtime_owner_id,p_engine_version,p_engine_checksum,
      p_input_snapshot_hash,p_next_snapshot,p_events,p_projection,p_terminal_effects);
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_auth_user_id::text||':'||p_command_id::text,0));
  select * into v_receipt from public.authoritative_battle_command_receipt where auth_user_id=p_auth_user_id and command_id=p_command_id;
  if found then
    if v_receipt.battle_id<>p_battle_id or v_receipt.command_type<>p_command_type or v_receipt.command_hash<>p_command_hash then
      raise exception 'command id was reused with a different payload' using errcode='22023'; end if;
    return v_receipt.result;
  end if;
  if p_command_type='initialize' then
    if p_next_snapshot->'playerItems' is distinct from server_authority_private.capture_battle_inventory(p_auth_user_id,v_battle.catalog_release_id)
      or p_projection->'player_items' is distinct from p_next_snapshot->'playerItems' then
      raise exception 'capture initialization inventory is not canonical' using errcode='22023'; end if;
    return server_authority_private.commit_edge_battle_command_before_capture(p_auth_user_id,p_command_id,p_command_type,p_command_hash,
      p_expected_player_revision,p_battle_id,p_expected_battle_version,p_runtime_owner_id,p_engine_version,p_engine_checksum,
      p_input_snapshot_hash,p_next_snapshot,p_events,p_projection,p_terminal_effects);
  end if;
  if p_command_type in ('item','ball') then
    if v_battle.status<>'active' or v_battle.battle_version<>p_expected_battle_version or v_battle.runtime_owner_id<>p_runtime_owner_id
      or v_battle.engine_version is distinct from p_engine_version or v_battle.engine_checksum is distinct from p_engine_checksum then
      raise exception 'capture item version conflict' using errcode='40001'; end if;
    select revision into strict v_revision from public.player_state_revision where auth_user_id=p_auth_user_id for update;
    if v_revision<>p_expected_player_revision then raise exception 'player revision conflict' using errcode='40001'; end if;
    if p_command_type='ball' then
      if p_events#>>'{0,type}'<>'ball_resolved' or p_events#>>'{0,data,command_type}'<>'ball' then
        raise exception 'ball journal fact is invalid' using errcode='22023'; end if;
      v_index:=server_authority_private.edge_jsonb_bigint(p_events#>'{0,data,item_index}');
      v_consumed:=coalesce(server_authority_private.edge_jsonb_boolean(p_events#>'{0,data,item_consumed}'),false);
      v_success:=coalesce(server_authority_private.edge_jsonb_boolean(p_events#>'{0,data,capture_success}'),false);
      if not exists(select 1 from public.player_encounter where id=v_battle.encounter_id and status='active') then
        raise exception 'L''incontro di cattura non e piu attivo prima della conferma della Ball.' using errcode='40001'; end if;
      if server_authority_private.edge_jsonb_bigint(p_events#>'{0,data,target_slot}')<>0
        or p_projection->>'capture_success' is distinct from v_success::text
        or (v_success and not v_consumed) then raise exception 'ball outcome descriptor is invalid' using errcode='22023'; end if;
    else
      if p_events#>>'{0,type}'<>'command_resolved' or p_events#>>'{0,data,command_type}'<>'item' then
        raise exception 'capture item journal fact is invalid' using errcode='22023'; end if;
      v_index:=server_authority_private.edge_jsonb_bigint(p_events#>'{0,data,item_index}');
      v_consumed:=coalesce(server_authority_private.edge_jsonb_boolean(p_events#>'{0,data,item_consumed}'),false);
      v_success:=false;
    end if;
    select * into v_item from public.catalog_item where catalog_release_id=v_battle.catalog_release_id and item_index=v_index;
    if not found or (p_command_type='ball' and v_item.category_key<>'ball')
      or (p_command_type='item' and not ((v_item.category_key='battle_item' and v_item.subcategory_key in ('heal_hp','heal_full','heal_ko','heal_status','weather'))
        or (v_item.category_key='berry' and v_item.item_index between 300 and 308 and v_item.subcategory_key in ('heal_hp','heal_status')))) then
      raise exception 'item class is unsupported by capture' using errcode='22023'; end if;
    if p_command_type='ball' then
      if jsonb_typeof(p_events#>'{0,data,catch_rate}')<>'number'
        or p_events#>>'{0,data,catch_rate}' !~ '^[0-9]+([.][0-9]+)?$' then
        raise exception 'capture rate audit is invalid' using errcode='22023'; end if;
      v_rate:=(p_events#>>'{0,data,catch_rate}')::numeric;
      select least(100,greatest(0,(v_item.rules->>'value')::numeric*r.catch_multiplier*h.catch_multiplier))
        into v_expected_rate from public.player_encounter e
        join public.catalog_rarity_rule r on r.catalog_release_id=e.catalog_release_id and r.rarity_key=e.rarity_key
        join lateral (select catch_multiplier from public.catalog_capture_hp_threshold t
          where t.catalog_release_id=e.catalog_release_id
            and (select current_hp from public.authoritative_battle_participant where battle_id=p_battle_id and side='npc' and slot_index=0)::numeric
              / e.max_hp<=t.max_hp_fraction order by t.threshold_order limit 1) h on true
        where e.id=v_battle.encounter_id and jsonb_typeof(v_item.rules->'value')='number';
      if v_expected_rate is null or abs(v_rate-v_expected_rate)>0.000000001 then
        raise exception 'trusted JS capture rate diverges from the exact catalog/encounter state' using errcode='22023'; end if;
    end if;
    select server_authority_private.edge_jsonb_bigint(value->1) into v_before from jsonb_array_elements(v_battle.engine_snapshot->'playerItems')
      where server_authority_private.edge_jsonb_bigint(value->0)=v_index;
    select server_authority_private.edge_jsonb_bigint(value->1) into v_after from jsonb_array_elements(p_next_snapshot->'playerItems')
      where server_authority_private.edge_jsonb_bigint(value->0)=v_index;
    if p_projection->'player_items' is distinct from p_next_snapshot->'playerItems'
      or (v_consumed and (v_before<=0 or v_after<>v_before-1))
      or (not v_consumed and (v_before<=0 or v_after is distinct from v_before))
      or exists(select 1 from jsonb_array_elements(v_battle.engine_snapshot->'playerItems') old(value)
        full join jsonb_array_elements(p_next_snapshot->'playerItems') new(value)
          on server_authority_private.edge_jsonb_bigint(old.value->0)=server_authority_private.edge_jsonb_bigint(new.value->0)
        where coalesce(server_authority_private.edge_jsonb_bigint(old.value->0),server_authority_private.edge_jsonb_bigint(new.value->0))<>v_index
          and old.value is distinct from new.value) then raise exception 'battle-local inventory delta is invalid' using errcode='22023'; end if;
    if p_command_type='item' and coalesce(server_authority_private.edge_jsonb_bigint(p_next_snapshot#>array['manager','usedItems',v_item.display_name]),0)>3 then
      raise exception 'capture battle item use limit exceeded' using errcode='22023'; end if;
    if v_consumed then
      select quantity into v_db from public.player_inventory_item where auth_user_id=p_auth_user_id
        and catalog_release_id=v_battle.catalog_release_id and item_index=v_index for update;
      if not found or v_db<>v_before then raise exception 'canonical item quantity is stale' using errcode='40001'; end if;
      update public.player_inventory_item set quantity=quantity-1,updated_at=now() where auth_user_id=p_auth_user_id and item_index=v_index;
      delete from public.player_inventory_item where auth_user_id=p_auth_user_id and item_index=v_index and quantity=0;
    end if;
    v_core_projection:=p_projection;
    if p_command_type='ball' and v_success then
      v_core_projection:=jsonb_set(v_core_projection,'{result_key}',to_jsonb('player_win_no_reward'::text),true);
    end if;
    v_result:=server_authority_private.commit_edge_battle_command_without_items(p_auth_user_id,p_command_id,'item',p_command_hash,
      p_expected_player_revision,p_battle_id,p_expected_battle_version,p_runtime_owner_id,p_engine_version,p_engine_checksum,
      p_input_snapshot_hash,p_next_snapshot,p_events,v_core_projection,jsonb_build_object('reward','none','inventory','unchanged','team','unchanged'));
    update public.authoritative_battle_command_receipt set command_type=p_command_type where auth_user_id=p_auth_user_id and command_id=p_command_id;
    if p_command_type='ball' and v_success then
      return server_authority_private.finish_capture_success(p_auth_user_id,p_battle_id,p_command_id,p_command_hash,v_index,v_result);
    end if;
    if p_projection->>'status' in ('concluded','abandoned') then
      update public.player_encounter set status='cancelled'
        where id=v_battle.encounter_id and status='active';
    end if;
    if p_command_type='ball' then
      select revision into v_revision from public.player_state_revision where auth_user_id=p_auth_user_id;
      insert into public.player_command_receipt(auth_user_id,command_id,command_type,request_hash,result,resulting_revision)
        values(p_auth_user_id,p_command_id,'wild_capture_attempt',p_command_hash,
          jsonb_build_object('capture_success',false,'item_index',v_index,'battle_id',p_battle_id),v_revision)
        returning * into v_player_receipt;
    elsif v_consumed then
      select revision into v_revision from public.player_state_revision where auth_user_id=p_auth_user_id;
      insert into public.player_command_receipt(auth_user_id,command_id,command_type,request_hash,result,resulting_revision)
        values(p_auth_user_id,p_command_id,'authoritative_battle_item',p_command_hash,
          jsonb_build_object('item_index',v_index,'battle_id',p_battle_id),v_revision) returning * into v_player_receipt;
      perform server_authority_private.apply_mission_fact(v_player_receipt.auth_user_id,'battle-item-used',
        jsonb_build_object('itemIndex',v_index,'battleId',p_battle_id,'contract','capture'),v_player_receipt.created_at);
    end if;
    v_result:=v_result||jsonb_build_object('capture_success',false,'player_state',server_authority_private.player_state_projection(p_auth_user_id));
    update public.authoritative_battle_command_receipt set result=v_result where auth_user_id=p_auth_user_id and command_id=p_command_id;
    return v_result;
  end if;
  v_result:=server_authority_private.commit_edge_battle_command_before_capture(p_auth_user_id,p_command_id,p_command_type,p_command_hash,
    p_expected_player_revision,p_battle_id,p_expected_battle_version,p_runtime_owner_id,p_engine_version,p_engine_checksum,
    p_input_snapshot_hash,p_next_snapshot,p_events,p_projection,p_terminal_effects);
  if p_projection->>'status' in ('concluded','abandoned') then
    update public.player_encounter set status='cancelled'
      where id=v_battle.encounter_id and status='active';
    v_result:=v_result||jsonb_build_object('player_state',server_authority_private.player_state_projection(p_auth_user_id));
    update public.authoritative_battle_command_receipt set result=v_result where auth_user_id=p_auth_user_id and command_id=p_command_id;
  end if;
  return v_result;
end;
$_$;

CREATE OR REPLACE FUNCTION "server_authority_private"."emit_ordinary_level_events"("p_auth_user_id" "uuid", "p_progression_id" "uuid", "p_command_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'pg_temp'
    AS $$
declare v_receipt public.player_command_receipt%rowtype; v_entry record; v_species text;
begin
  select * into v_receipt from public.player_command_receipt where auth_user_id=p_auth_user_id and command_id=p_command_id;
  if not found then return; end if;
  for v_entry in select * from public.player_ordinary_progression_pokemon where progression_id=p_progression_id
    and levels_gained>levels_reported order by award_order for update loop
    select species_key into v_species from public.player_pokemon_instance where id=v_entry.pokemon_instance_id;
    perform server_authority_private.apply_mission_fact(v_receipt.auth_user_id,'pokemon_level_up',
      jsonb_build_object('speciesKey',v_species,'levels',v_entry.levels_gained-v_entry.levels_reported,'source','ordinary'),
      v_receipt.created_at);
    update public.player_ordinary_progression_pokemon set levels_reported=levels_gained
      where progression_id=p_progression_id and pokemon_instance_id=v_entry.pokemon_instance_id;
  end loop;
end;
$$;

CREATE OR REPLACE FUNCTION "server_authority_private"."execute_garden_command"("p_command_type" "text", "p_command_id" "uuid", "p_expected_revision" bigint, "p_plot_index" integer DEFAULT NULL::integer, "p_item_index" integer DEFAULT NULL::integer) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'extensions', 'pg_temp'
    AS $_$
declare
  v_auth_user_id uuid := auth.uid();
  v_request jsonb;
  v_request_hash text;
  v_receipt_type text;
  v_receipt_hash text;
  v_receipt_result jsonb;
  v_current_revision bigint;
  v_profile public.player_profile_state%rowtype;
  v_plot public.player_garden_plot_state%rowtype;
  v_daily public.player_daily_claim_state%rowtype;
  v_catalog_release_id uuid;
  v_catalog_status text;
  v_allow_draft boolean;
  v_engine_contract text;
  v_item public.catalog_item%rowtype;
  v_inventory_quantity integer := 0;
  v_growth_hours integer;
  v_harvest_quantity integer;
  v_reward_pool text;
  v_pool_count integer;
  v_random_bytes bytea;
  v_random_value bigint;
  v_reward_offset integer;
  v_local_date date;
  v_event_time timestamptz := now();
  v_result jsonb;
begin
  if v_auth_user_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if p_command_type not in ('garden_plant', 'garden_harvest', 'daily_berry_claim') then
    raise exception 'garden command type is not allowed' using errcode = '22023';
  end if;
  if p_command_id is null then
    raise exception 'command id is required' using errcode = '22023';
  end if;
  if p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'expected revision must be non-negative' using errcode = '22023';
  end if;
  if p_command_type in ('garden_plant', 'garden_harvest')
     and (p_plot_index is null or p_plot_index not between 0 and 2) then
    raise exception 'plot index must be between 0 and 2' using errcode = '22023';
  end if;
  if p_command_type = 'garden_plant' and (p_item_index is null or p_item_index <= 0) then
    raise exception 'item index must be positive' using errcode = '22023';
  end if;
  if p_command_type <> 'garden_plant' and p_item_index is not null then
    raise exception 'item index is not accepted for this command' using errcode = '22023';
  end if;

  v_request := jsonb_build_object(
    'command_type', p_command_type,
    'expected_revision', p_expected_revision,
    'plot_index', p_plot_index,
    'item_index', p_item_index
  );
  v_request_hash := encode(digest(convert_to(v_request::text, 'UTF8'), 'sha256'), 'hex');

  perform pg_advisory_xact_lock(hashtextextended(v_auth_user_id::text || ':' || p_command_id::text, 0));
  select command_type, request_hash, result
  into v_receipt_type, v_receipt_hash, v_receipt_result
  from public.player_command_receipt
  where auth_user_id = v_auth_user_id and command_id = p_command_id;

  if found then
    if v_receipt_type <> p_command_type or v_receipt_hash <> v_request_hash then
      raise exception 'command id was already used with a different payload' using errcode = '22023';
    end if;
    return v_receipt_result;
  end if;

  select revision into v_current_revision
  from public.player_state_revision
  where auth_user_id = v_auth_user_id
  for update;
  if not found then
    raise exception 'player state does not exist' using errcode = 'P0002';
  end if;
  if v_current_revision <> p_expected_revision then
    raise exception 'revision conflict: expected %, current %', p_expected_revision, v_current_revision using errcode = '40001';
  end if;

  select * into v_profile
  from public.player_profile_state
  where auth_user_id = v_auth_user_id
  for update;
  if not found or v_profile.starter_status <> 'selected' then
    raise exception 'player profile is not ready' using errcode = '55000';
  end if;

  select config.catalog_release_id, release.status, config.allow_draft, config.engine_contract
  into v_catalog_release_id, v_catalog_status, v_allow_draft, v_engine_contract
  from server_authority_private.runtime_catalog_config config
  join public.catalog_release release on release.id = config.catalog_release_id
  where config.runtime_key = 'garden';
  if v_catalog_release_id is null
     or v_engine_contract <> 'garden'
     or (v_catalog_status <> 'published' and not (v_catalog_status = 'draft' and v_allow_draft)) then
    raise exception 'garden runtime catalog is not ready';
  end if;
  if v_profile.catalog_release_id <> v_catalog_release_id then
    raise exception 'player catalog is not bound to the garden runtime catalog' using errcode = '55000';
  end if;

  if p_command_type in ('garden_plant', 'garden_harvest') then
    insert into public.player_garden_plot_state(auth_user_id, plot_index)
    values (v_auth_user_id, p_plot_index)
    on conflict (auth_user_id, plot_index) do nothing;
    select * into v_plot
    from public.player_garden_plot_state
    where auth_user_id = v_auth_user_id and plot_index = p_plot_index
    for update;
  else
    insert into public.player_daily_claim_state(auth_user_id, claim_type)
    values (v_auth_user_id, 'berry')
    on conflict (auth_user_id, claim_type) do nothing;
    select * into v_daily
    from public.player_daily_claim_state
    where auth_user_id = v_auth_user_id and claim_type = 'berry'
    for update;
  end if;

  if p_command_type = 'garden_plant' then
    select * into v_item
    from public.catalog_item item
    where item.catalog_release_id = v_catalog_release_id and item.item_index = p_item_index;
    if not found or v_item.category_key <> 'berry'
       or jsonb_typeof(v_item.rules -> 'berryGrowthHours') is distinct from 'number'
       or (v_item.rules ->> 'berryGrowthHours') not in ('36', '60') then
      raise exception 'item is not a plantable berry' using errcode = '22023';
    end if;
    if v_plot.berry_item_index is not null then
      raise exception 'garden plot is occupied' using errcode = '22023';
    end if;
    v_growth_hours := (v_item.rules ->> 'berryGrowthHours')::integer;

    select quantity into v_inventory_quantity
    from public.player_inventory_item
    where auth_user_id = v_auth_user_id and item_index = p_item_index
    for update;
    if not found or v_inventory_quantity < 1 then
      raise exception 'berry is not available in inventory' using errcode = '22023';
    end if;
    if v_inventory_quantity = 1 then
      delete from public.player_inventory_item
      where auth_user_id = v_auth_user_id and item_index = p_item_index;
    else
      update public.player_inventory_item
      set quantity = quantity - 1, updated_at = v_event_time
      where auth_user_id = v_auth_user_id and item_index = p_item_index;
    end if;
    update public.player_garden_plot_state
    set catalog_release_id = v_catalog_release_id,
        berry_item_index = p_item_index,
        planted_at = v_event_time,
        ready_at = v_event_time + make_interval(hours => v_growth_hours),
        updated_at = v_event_time
    where auth_user_id = v_auth_user_id and plot_index = p_plot_index;
  elsif p_command_type = 'garden_harvest' then
    if v_plot.berry_item_index is null then
      raise exception 'garden plot is empty' using errcode = '22023';
    end if;
    select * into v_item
    from public.catalog_item item
    where item.catalog_release_id = v_catalog_release_id
      and item.item_index = v_plot.berry_item_index;
    if v_plot.catalog_release_id <> v_catalog_release_id
       or not found
       or v_item.category_key <> 'berry'
       or jsonb_typeof(v_item.rules -> 'berryGrowthHours') is distinct from 'number'
       or (v_item.rules ->> 'berryGrowthHours') not in ('36', '60') then
      raise exception 'planted berry is not valid for the garden runtime catalog' using errcode = '55000';
    end if;
    if v_plot.ready_at > v_event_time then
      raise exception 'garden plot is not ready' using errcode = '22023';
    end if;
    select (rules ->> 'value')::integer into v_harvest_quantity
    from public.catalog_progression_rule
    where catalog_release_id = v_catalog_release_id
      and rule_family = 'constant'
      and rule_key = 'garden_harvest_quantity'
      and jsonb_typeof(rules -> 'value') = 'number'
      and (rules ->> 'value') ~ '^[1-9][0-9]*$';
    if v_harvest_quantity is null or v_harvest_quantity > 1000000 then
      raise exception 'garden harvest quantity rule is invalid';
    end if;

    perform 1 from public.player_inventory_item
    where auth_user_id = v_auth_user_id and item_index = v_plot.berry_item_index
    for update;
    select coalesce((select quantity from public.player_inventory_item
      where auth_user_id = v_auth_user_id and item_index = v_plot.berry_item_index), 0)
    into v_inventory_quantity;
    if v_inventory_quantity::bigint + v_harvest_quantity > 2147483647 then
      raise exception 'inventory quantity limit exceeded' using errcode = '22003';
    end if;
    insert into public.player_inventory_item(auth_user_id, catalog_release_id, item_index, quantity, updated_at)
    values (v_auth_user_id, v_catalog_release_id, v_plot.berry_item_index, v_harvest_quantity, v_event_time)
    on conflict (auth_user_id, item_index) do update
      set quantity = public.player_inventory_item.quantity + excluded.quantity,
          updated_at = excluded.updated_at;
    update public.player_garden_plot_state
    set catalog_release_id = null, berry_item_index = null, planted_at = null, ready_at = null, updated_at = v_event_time
    where auth_user_id = v_auth_user_id and plot_index = p_plot_index;
  else
    v_local_date := (v_event_time at time zone 'Europe/Rome')::date;
    if v_daily.last_claim_local_date = v_local_date then
      raise exception 'daily berry was already claimed for Europe/Rome date %', v_local_date using errcode = '22023';
    end if;

    v_random_bytes := gen_random_bytes(4);
    v_random_value := get_byte(v_random_bytes, 0)::bigint * 16777216
      + get_byte(v_random_bytes, 1)::bigint * 65536
      + get_byte(v_random_bytes, 2)::bigint * 256
      + get_byte(v_random_bytes, 3)::bigint;
    v_reward_pool := case when mod(v_random_value, 100) < 90 then 'normal' else 'long' end;
    select count(*)::integer into v_pool_count
    from public.catalog_item item
    where item.catalog_release_id = v_catalog_release_id
      and item.category_key = 'berry'
      and item.rules ->> 'berryGrowthHours' = case when v_reward_pool = 'normal' then '36' else '60' end;
    if v_pool_count <= 0 then
      raise exception 'daily berry reward pool is empty';
    end if;
    v_random_bytes := gen_random_bytes(4);
    v_random_value := get_byte(v_random_bytes, 0)::bigint * 16777216
      + get_byte(v_random_bytes, 1)::bigint * 65536
      + get_byte(v_random_bytes, 2)::bigint * 256
      + get_byte(v_random_bytes, 3)::bigint;
    v_reward_offset := mod(v_random_value, v_pool_count)::integer;
    select * into v_item
    from public.catalog_item item
    where item.catalog_release_id = v_catalog_release_id
      and item.category_key = 'berry'
      and item.rules ->> 'berryGrowthHours' = case when v_reward_pool = 'normal' then '36' else '60' end
    order by item.item_index
    offset v_reward_offset limit 1;

    perform 1 from public.player_inventory_item
    where auth_user_id = v_auth_user_id and item_index = v_item.item_index
    for update;
    select coalesce((select quantity from public.player_inventory_item
      where auth_user_id = v_auth_user_id and item_index = v_item.item_index), 0)
    into v_inventory_quantity;
    if v_inventory_quantity = 2147483647 then
      raise exception 'inventory quantity limit exceeded' using errcode = '22003';
    end if;
    insert into public.player_inventory_item(auth_user_id, catalog_release_id, item_index, quantity, updated_at)
    values (v_auth_user_id, v_catalog_release_id, v_item.item_index, 1, v_event_time)
    on conflict (auth_user_id, item_index) do update
      set quantity = public.player_inventory_item.quantity + 1,
          updated_at = excluded.updated_at;
    update public.player_daily_claim_state
    set last_claim_local_date = v_local_date,
        claimed_at = v_event_time,
        catalog_release_id = v_catalog_release_id,
        reward_item_index = v_item.item_index,
        updated_at = v_event_time
    where auth_user_id = v_auth_user_id and claim_type = 'berry';
  end if;

  update public.player_state_revision
  set revision = revision + 1, updated_at = v_event_time
  where auth_user_id = v_auth_user_id
  returning revision into v_current_revision;

  v_result := server_authority_private.player_state_projection(v_auth_user_id)
    || jsonb_build_object(
      'command_id', p_command_id,
      'command_type', p_command_type,
      'plot_index', p_plot_index,
      'berry_index', case when p_command_type = 'garden_harvest' then v_plot.berry_item_index when p_command_type = 'garden_plant' then p_item_index else v_item.item_index end,
      'quantity', case when p_command_type = 'garden_harvest' then v_harvest_quantity when p_command_type = 'daily_berry_claim' then 1 else null end,
      'reward_item_index', case when p_command_type = 'daily_berry_claim' then v_item.item_index else null end,
      'reward_name', case when p_command_type = 'daily_berry_claim' then v_item.display_name else null end,
      'claimed_local_date', case when p_command_type = 'daily_berry_claim' then v_local_date else null end
    );
  insert into public.player_command_receipt(auth_user_id, command_id, command_type, request_hash, result, resulting_revision)
  values (v_auth_user_id, p_command_id, p_command_type, v_request_hash, v_result, v_current_revision);
  return v_result;
end;
$_$;

CREATE OR REPLACE FUNCTION "server_authority_private"."execute_shop_command"("p_command_type" "text", "p_command_id" "uuid", "p_expected_revision" bigint, "p_item_index" integer, "p_quantity" integer) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'extensions', 'pg_temp'
    AS $_$
declare
  v_auth_user_id uuid := auth.uid();
  v_request jsonb;
  v_request_hash text;
  v_receipt_type text;
  v_receipt_hash text;
  v_receipt_result jsonb;
  v_current_revision bigint;
  v_profile public.player_profile_state%rowtype;
  v_catalog_release_id uuid;
  v_catalog_status text;
  v_allow_draft boolean;
  v_engine_contract text;
  v_offer public.catalog_shop_offer%rowtype;
  v_inventory_quantity integer := 0;
  v_purchased_quantity bigint := 0;
  v_unit_price bigint;
  v_total numeric;
  v_stock_limit bigint;
  v_result jsonb;
begin
  if v_auth_user_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if p_command_type not in ('shop_buy', 'shop_sell') then
    raise exception 'shop command type is not allowed' using errcode = '22023';
  end if;
  if p_command_id is null then
    raise exception 'command id is required' using errcode = '22023';
  end if;
  if p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'expected revision must be non-negative' using errcode = '22023';
  end if;
  if p_item_index is null or p_item_index <= 0 then
    raise exception 'item index must be positive' using errcode = '22023';
  end if;
  if p_quantity is null or p_quantity <= 0 or p_quantity > 1000000 then
    raise exception 'quantity must be between 1 and 1000000' using errcode = '22023';
  end if;

  v_request := jsonb_build_object(
    'command_type', p_command_type,
    'expected_revision', p_expected_revision,
    'item_index', p_item_index,
    'quantity', p_quantity
  );
  v_request_hash := encode(digest(convert_to(v_request::text, 'UTF8'), 'sha256'), 'hex');

  perform pg_advisory_xact_lock(
    hashtextextended(v_auth_user_id::text || ':' || p_command_id::text, 0)
  );

  select command_type, request_hash, result
  into v_receipt_type, v_receipt_hash, v_receipt_result
  from public.player_command_receipt
  where auth_user_id = v_auth_user_id
    and command_id = p_command_id;

  if found then
    if v_receipt_type <> p_command_type or v_receipt_hash <> v_request_hash then
      raise exception 'command id was already used with a different payload' using errcode = '22023';
    end if;
    return v_receipt_result;
  end if;

  select revision into v_current_revision
  from public.player_state_revision
  where auth_user_id = v_auth_user_id
  for update;

  if not found then
    raise exception 'player state does not exist' using errcode = 'P0002';
  end if;
  if v_current_revision <> p_expected_revision then
    raise exception 'revision conflict: expected %, current %', p_expected_revision, v_current_revision
      using errcode = '40001';
  end if;

  select * into v_profile
  from public.player_profile_state
  where auth_user_id = v_auth_user_id
  for update;

  if not found or v_profile.starter_status <> 'selected' then
    raise exception 'player profile is not ready' using errcode = '55000';
  end if;

  select config.catalog_release_id, release.status, config.allow_draft, config.engine_contract
  into v_catalog_release_id, v_catalog_status, v_allow_draft, v_engine_contract
  from server_authority_private.runtime_catalog_config config
  join public.catalog_release release on release.id = config.catalog_release_id
  where config.runtime_key = 'shop';

  if v_catalog_release_id is null
     or v_engine_contract <> 'shop'
     or (v_catalog_status <> 'published' and not (v_catalog_status = 'draft' and v_allow_draft)) then
    raise exception 'shop runtime catalog is not ready';
  end if;
  if v_profile.catalog_release_id <> v_catalog_release_id then
    raise exception 'player catalog is not bound to the shop runtime catalog' using errcode = '55000';
  end if;

  select * into v_offer
  from public.catalog_shop_offer offer
  where offer.catalog_release_id = v_catalog_release_id
    and offer.item_index = p_item_index;

  if not found then
    raise exception 'shop offer was not found' using errcode = '22023';
  end if;

  perform 1 from public.player_inventory_item inventory
  where inventory.auth_user_id = v_auth_user_id
    and inventory.item_index = p_item_index
  for update;
  select coalesce((
    select inventory.quantity from public.player_inventory_item inventory
    where inventory.auth_user_id = v_auth_user_id
      and inventory.item_index = p_item_index
  ), 0) into v_inventory_quantity;

  perform 1 from public.player_shop_purchase_state purchase
  where purchase.auth_user_id = v_auth_user_id
    and purchase.item_index = p_item_index
  for update;
  select coalesce((
    select purchase.purchased_quantity from public.player_shop_purchase_state purchase
    where purchase.auth_user_id = v_auth_user_id
      and purchase.item_index = p_item_index
  ), 0) into v_purchased_quantity;

  if p_command_type = 'shop_buy' then
    if not v_offer.purchase_enabled or v_offer.price is null or v_offer.price < 0 then
      raise exception 'item is not available for purchase' using errcode = '22023';
    end if;
    if v_offer.unlock_rules <> '{}'::jsonb then
      if (v_offer.unlock_rules ->> 'kind') is distinct from 'badges'
         or jsonb_typeof(v_offer.unlock_rules -> 'value') is distinct from 'number'
         or (v_offer.unlock_rules ->> 'value') !~ '^[0-9]+$' then
        raise exception 'shop unlock rule is not supported';
      end if;
      if v_profile.badges < (v_offer.unlock_rules ->> 'value')::integer then
        raise exception 'item is locked by badge progression' using errcode = '22023';
      end if;
    end if;

    if v_offer.stock_rules <> '{}'::jsonb then
      if coalesce(v_offer.stock_rules ->> 'kind', '') not in ('fixed', 'single_owned')
         or jsonb_typeof(v_offer.stock_rules -> 'limit') is distinct from 'number'
         or (v_offer.stock_rules ->> 'limit') !~ '^[1-9][0-9]*$' then
        raise exception 'shop stock rule is not supported';
      end if;
      v_stock_limit := (v_offer.stock_rules ->> 'limit')::bigint;
      if v_purchased_quantity + p_quantity > v_stock_limit then
        raise exception 'requested quantity exceeds personal stock' using errcode = '22023';
      end if;
    end if;
    if v_offer.single_purchase and v_purchased_quantity + p_quantity > 1 then
      raise exception 'item can only be purchased once' using errcode = '22023';
    end if;
    if v_inventory_quantity::bigint + p_quantity > 2147483647 then
      raise exception 'inventory quantity limit exceeded' using errcode = '22003';
    end if;

    v_unit_price := v_offer.price;
    v_total := v_unit_price::numeric * p_quantity;
    if v_total > 9223372036854775807 or v_profile.pokedollars < v_total then
      raise exception 'insufficient pokedollars' using errcode = '22023';
    end if;

    update public.player_profile_state
    set pokedollars = pokedollars - v_total::bigint,
        updated_at = now()
    where auth_user_id = v_auth_user_id;

    insert into public.player_inventory_item (
      auth_user_id, catalog_release_id, item_index, quantity, updated_at
    ) values (
      v_auth_user_id, v_catalog_release_id, p_item_index, p_quantity, now()
    ) on conflict (auth_user_id, item_index) do update
      set quantity = public.player_inventory_item.quantity + excluded.quantity,
          updated_at = now();

    insert into public.player_shop_purchase_state (
      auth_user_id, catalog_release_id, item_index, purchased_quantity, updated_at
    ) values (
      v_auth_user_id, v_catalog_release_id, p_item_index, p_quantity, now()
    ) on conflict (auth_user_id, item_index) do update
      set purchased_quantity = public.player_shop_purchase_state.purchased_quantity + excluded.purchased_quantity,
          updated_at = now();
  else
    if not v_offer.sale_enabled
       or jsonb_typeof(v_offer.sale_rules -> 'price') is distinct from 'number'
       or (v_offer.sale_rules ->> 'price') !~ '^[0-9]+$' then
      raise exception 'item is not available for sale' using errcode = '22023';
    end if;
    if v_inventory_quantity < p_quantity then
      raise exception 'insufficient inventory quantity' using errcode = '22023';
    end if;

    v_unit_price := (v_offer.sale_rules ->> 'price')::bigint;
    v_total := v_unit_price::numeric * p_quantity;
    if v_total > 9223372036854775807 - v_profile.pokedollars then
      raise exception 'pokedollar limit exceeded' using errcode = '22003';
    end if;

    update public.player_profile_state
    set pokedollars = pokedollars + v_total::bigint,
        updated_at = now()
    where auth_user_id = v_auth_user_id;

    if v_inventory_quantity = p_quantity then
      delete from public.player_inventory_item
      where auth_user_id = v_auth_user_id
        and item_index = p_item_index;
    else
      update public.player_inventory_item
      set quantity = quantity - p_quantity,
          updated_at = now()
      where auth_user_id = v_auth_user_id
        and item_index = p_item_index;
    end if;
  end if;

  update public.player_state_revision
  set revision = revision + 1,
      updated_at = now()
  where auth_user_id = v_auth_user_id
  returning revision into v_current_revision;

  v_result := server_authority_private.player_state_projection(v_auth_user_id)
    || jsonb_build_object(
      'command_id', p_command_id,
      'command_type', p_command_type,
      'item_index', p_item_index,
      'quantity', p_quantity,
      'unit_price', v_unit_price,
      'total', v_total::bigint
    );

  insert into public.player_command_receipt (
    auth_user_id, command_id, command_type, request_hash, result, resulting_revision
  ) values (
    v_auth_user_id, p_command_id, p_command_type, v_request_hash, v_result, v_current_revision
  );

  return v_result;
end;
$_$;

CREATE OR REPLACE FUNCTION "server_authority_private"."finish_capture_success"("p_auth_user_id" "uuid", "p_battle_id" "uuid", "p_command_id" "uuid", "p_command_hash" "text", "p_item_index" integer, "p_result" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'pg_temp'
    AS $$
declare v_battle public.authoritative_battle%rowtype; v_encounter public.player_encounter%rowtype; v_instance uuid:=gen_random_uuid();
  v_state jsonb; v_count integer; v_species_count integer; v_slot integer; v_box bigint; v_place text; v_revision bigint;
  v_receipt public.player_command_receipt%rowtype; v_player jsonb; v_result jsonb:=p_result;
begin
  select * into strict v_battle from public.authoritative_battle where id=p_battle_id and auth_user_id=p_auth_user_id for update;
  select * into strict v_encounter from public.player_encounter where id=v_battle.encounter_id and auth_user_id=p_auth_user_id for update;
  if v_encounter.status<>'active' then
    raise exception 'L''incontro associato non e piu attivo.' using errcode='40001'; end if;
  v_state:=jsonb_build_object('s',v_encounter.species_key,'g',case v_encounter.gender_key when 'male' then 'male' when 'female' then 'female' else null end,
    'l',v_encounter.level,'hp',v_encounter.max_hp,'m',v_encounter.moves,'xp',0);
  insert into public.player_pokemon_instance(id,auth_user_id,catalog_release_id,species_key,state_version,state,revision)
    values(v_instance,p_auth_user_id,v_encounter.catalog_release_id,v_encounter.species_key,1,v_state,1);
  select count(*) into v_count from public.player_pokemon_placement where auth_user_id=p_auth_user_id and placement_type='team';
  select count(*) into v_species_count from public.player_pokemon_placement p join public.player_pokemon_instance i on i.id=p.pokemon_instance_id
    where p.auth_user_id=p_auth_user_id and p.placement_type='team' and i.species_key=v_encounter.species_key;
  if v_count<6 and v_species_count<2 then
    select slot into v_slot from generate_series(0,5) slot where not exists(select 1 from public.player_pokemon_placement
      where auth_user_id=p_auth_user_id and placement_type='team' and slot_index=slot) order by slot limit 1;
    insert into public.player_pokemon_placement(pokemon_instance_id,auth_user_id,placement_type,slot_index,box_index)
      values(v_instance,p_auth_user_id,'team',v_slot,null); v_place:='team';
  else
    insert into public.player_box_index_state(auth_user_id,next_box_index)
      select p_auth_user_id,coalesce(max(box_index),-1)::bigint+1 from public.player_pokemon_placement
      where auth_user_id=p_auth_user_id and placement_type='box' on conflict(auth_user_id) do nothing;
    select next_box_index into v_box from public.player_box_index_state where auth_user_id=p_auth_user_id for update;
    select greatest(v_box,coalesce(max(box_index),-1)::bigint+1) into v_box from public.player_pokemon_placement
      where auth_user_id=p_auth_user_id and placement_type='box';
    if v_box>2147483647 then raise exception 'box index limit exceeded' using errcode='22003'; end if;
    update public.player_box_index_state set next_box_index=v_box+1,updated_at=now() where auth_user_id=p_auth_user_id;
    insert into public.player_pokemon_placement(pokemon_instance_id,auth_user_id,placement_type,slot_index,box_index)
      values(v_instance,p_auth_user_id,'box',null,v_box::integer); v_place:='box';
  end if;
  insert into public.player_dex_entry(auth_user_id,catalog_release_id,species_key)
    values(p_auth_user_id,v_encounter.catalog_release_id,v_encounter.species_key) on conflict do nothing;
  update public.player_encounter set status='consumed',consumed_at=now(),captured_pokemon_instance_id=v_instance where id=v_encounter.id;
  update public.authoritative_battle set result_key='pokemon_captured' where id=p_battle_id;
  select revision into v_revision from public.player_state_revision where auth_user_id=p_auth_user_id;
  v_player:=server_authority_private.player_state_projection(p_auth_user_id);
  v_result:=jsonb_set(v_result,'{battle,result_key}',to_jsonb('pokemon_captured'::text),true)
    ||jsonb_build_object('capture_success',true,'placement',v_place,'pokemon_instance_id',v_instance,'player_state',v_player);
  insert into public.player_command_receipt(auth_user_id,command_id,command_type,request_hash,result,resulting_revision)
    values(p_auth_user_id,p_command_id,'wild_capture_attempt',p_command_hash,
      jsonb_build_object('capture_success',true,'pokemon_instance_id',v_instance,'item_index',p_item_index,'battle_id',p_battle_id),v_revision)
    returning * into v_receipt;
  v_player:=server_authority_private.player_state_projection(p_auth_user_id);
  v_result:=jsonb_set(v_result,'{player_state}',v_player,true);
  update public.authoritative_battle_command_receipt set command_type='ball',result=v_result
    where auth_user_id=p_auth_user_id and command_id=p_command_id;
  return v_result;
end;
$$;

CREATE OR REPLACE FUNCTION "server_authority_private"."held_item_is_compatible"("p_catalog_release_id" "uuid", "p_species_key" "text", "p_item_index" integer) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'pg_temp'
    AS $$
  select coalesce((
    select item.category_key in ('held_item', 'berry')
      and not (item.rules ? 'allowedSpeciesKeys'
        and jsonb_typeof(item.rules -> 'allowedSpeciesKeys') <> 'array')
      and not (item.rules ? 'requiredType'
        and jsonb_typeof(item.rules -> 'requiredType') <> 'string')
      and not (item.rules ? 'requiredMonoType'
        and jsonb_typeof(item.rules -> 'requiredMonoType') <> 'string')
      and cardinality(species.types) > 0
      and not coalesce((jsonb_typeof(item.rules -> 'allowedSpeciesKeys') = 'array'
        and jsonb_array_length(item.rules -> 'allowedSpeciesKeys') > 0
        and not (item.rules -> 'allowedSpeciesKeys' ? p_species_key)), false)

      and not (item.rules ? 'requiredType'
        and not ((item.rules ->> 'requiredType') = any(species.types)))
      and not (item.rules ? 'requiredMonoType'
        and not (cardinality(species.types) = 1
          and species.types[1] = item.rules ->> 'requiredMonoType'))
    from public.catalog_item item
    join lateral (select array_agg(species_type.type_key order by species_type.type_order)
        filter (where species_type.type_key is not null) types
      from public.catalog_species catalog_species
      left join public.catalog_species_type species_type
        on species_type.catalog_release_id = catalog_species.catalog_release_id
        and species_type.species_key = catalog_species.species_key
      where catalog_species.catalog_release_id = p_catalog_release_id
        and catalog_species.species_key = p_species_key) species on true
    where item.catalog_release_id = p_catalog_release_id
      and item.item_index = p_item_index
  ), false);
$$;

CREATE OR REPLACE FUNCTION "server_authority_private"."mission_pokemon_reward_candidates"("p_catalog_release_id" "uuid", "p_level" integer, "p_exclude_fossils" boolean) RETURNS TABLE("species_key" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'pg_temp'
    AS $$
  with recursive lineage(root_species_key,species_key,minimum_level) as (
    select species.species_key,species.species_key,5 from public.catalog_species species
    where species.catalog_release_id=p_catalog_release_id
    union all
    select lineage.root_species_key,evolution.species_key,
      greatest(lineage.minimum_level,case when evolution.trigger_key='level'
        then coalesce((evolution.trigger_rules->>'level')::integer,101)
        else coalesce(parent.encounter_min_level,5) end)
    from lineage join public.catalog_species_evolution evolution
      on evolution.catalog_release_id=p_catalog_release_id and evolution.target_species_key=lineage.species_key
    join public.catalog_species parent on parent.catalog_release_id=p_catalog_release_id
      and parent.species_key=evolution.species_key
  ), minimums as (
    select root_species_key,max(minimum_level) minimum_level from lineage group by root_species_key
  )
  select species.species_key from public.catalog_species species
  join minimums on minimums.root_species_key=species.species_key
  where species.catalog_release_id=p_catalog_release_id and p_level between 5 and 100
    and minimums.minimum_level<=p_level and species.encounter_rarity_key<>'legendary'
    and (not coalesce(p_exclude_fossils,false) or species.encounter_rarity_key<>'fossil');
$$;

CREATE OR REPLACE FUNCTION "server_authority_private"."process_mission_command_receipt"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'pg_temp'
    AS $_$
declare
  v_species_key text;
  v_dex_number integer;
  v_types jsonb := '[]'::jsonb;
  v_badges integer := 0;
  v_source_species_key text;
  v_item_index integer;
begin
  perform server_authority_private.sync_player_missions(new.auth_user_id);
  select profile.badges into v_badges from public.player_profile_state profile
  where profile.auth_user_id = new.auth_user_id;

  if new.command_type = 'choose_starter' then
    v_dex_number := case when coalesce(new.result ->> 'starter_dex_number', '') ~ '^[1-9][0-9]*$'
      then (new.result ->> 'starter_dex_number')::integer else null end;
    v_species_key := new.result -> 'starter' ->> 'species_key';
    if v_dex_number is null or v_species_key is null then
      raise exception 'starter receipt is missing canonical mission species data';
    end if;
    perform server_authority_private.apply_mission_fact(new.auth_user_id, 'pokedex_species_registered',
      jsonb_build_object('dexNumber', v_dex_number, 'speciesKey', v_species_key), new.created_at);
  elsif new.command_type = 'garden_harvest' then
    perform server_authority_private.apply_mission_fact(new.auth_user_id, 'berries_harvested',
      jsonb_build_object('itemIndex', new.result -> 'berry_index', 'quantity', new.result -> 'quantity'), new.created_at);
  elsif new.command_type in ('daycare_withdraw', 'resolve_daycare_withdrawal')
    and new.result ->> 'withdrawal_status' = 'completed' then
    select pokemon.species_key into v_species_key
    from public.player_pokemon_instance pokemon
    where pokemon.auth_user_id = new.auth_user_id
      and pokemon.id = (new.result ->> 'pokemon_instance_id')::uuid;
    if v_species_key is null then
      raise exception 'completed daycare receipt is missing its canonical Pokemon';
    end if;
    perform server_authority_private.apply_mission_fact(new.auth_user_id, 'daycare_cycle_completed',
      jsonb_build_object('speciesKey', v_species_key), new.created_at);
    if coalesce((new.result ->> 'levels_gained')::integer, 0) > 0 then
      perform server_authority_private.apply_mission_fact(new.auth_user_id, 'pokemon_level_up',
        jsonb_build_object('speciesKey', v_species_key), new.created_at);
    end if;
  elsif new.command_type = 'wild_capture_attempt' then
    select fact.item_index into v_item_index
    from public.player_mission_pending_item_fact fact
    join public.player_profile_state profile on profile.auth_user_id = fact.auth_user_id
    join public.catalog_item item
      on item.catalog_release_id = profile.catalog_release_id
     and item.item_index = fact.item_index
    where fact.auth_user_id = new.auth_user_id
      and fact.transaction_id = txid_current()
      and item.category_key = 'ball'
    order by fact.item_index limit 1;
    if v_item_index is not null then
      perform server_authority_private.apply_mission_fact(new.auth_user_id, 'battle-item-used',
        jsonb_build_object('itemIndex', v_item_index), new.created_at);
    end if;
    if coalesce((new.result ->> 'capture_success')::boolean, false) then
      select pokemon.species_key, species.dex_number,
        coalesce((select jsonb_agg(species_type.type_key order by species_type.type_order)
          from public.catalog_species_type species_type
          where species_type.catalog_release_id = pokemon.catalog_release_id
            and species_type.species_key = pokemon.species_key), '[]'::jsonb)
      into v_species_key, v_dex_number, v_types
      from public.player_pokemon_instance pokemon
      join public.catalog_species species
        on species.catalog_release_id = pokemon.catalog_release_id and species.species_key = pokemon.species_key
      where pokemon.auth_user_id = new.auth_user_id
        and pokemon.id = (new.result ->> 'pokemon_instance_id')::uuid;
      if v_species_key is null or v_dex_number is null then
        raise exception 'successful capture receipt is missing canonical species data';
      end if;
      perform server_authority_private.apply_mission_fact(new.auth_user_id, 'pokemon_captured', jsonb_build_object(
        'speciesKey', v_species_key, 'dexNumber', v_dex_number, 'types', v_types, 'badges', v_badges), new.created_at);
      perform server_authority_private.apply_mission_fact(new.auth_user_id, 'pokedex_species_registered',
        jsonb_build_object('speciesKey', v_species_key, 'dexNumber', v_dex_number), new.created_at);
    end if;
  elsif new.command_type = 'pokemon_center_assign_held' then
    perform server_authority_private.apply_mission_fact(new.auth_user_id, 'held_item_assigned',
      jsonb_build_object('itemIndex', new.result -> 'item_index'), new.created_at);
  elsif new.command_type = 'pokemon_center_evolve' then
    select evolution.species_key into v_source_species_key
    from public.catalog_species_evolution evolution
    join public.player_profile_state profile on profile.catalog_release_id = evolution.catalog_release_id
    where profile.auth_user_id = new.auth_user_id
      and evolution.target_species_key = new.result ->> 'evolution_target_species_key'
      and evolution.trigger_key = 'item'
      and evolution.trigger_rules -> 'item' ->> 'itemIndex' = new.result ->> 'item_index'
    order by evolution.species_key limit 1;
    perform server_authority_private.apply_mission_fact(new.auth_user_id, 'pokemon_evolved', jsonb_build_object(
      'speciesKey', coalesce(v_source_species_key, new.result ->> 'evolution_target_species_key'),
      'targetSpeciesKey', new.result ->> 'evolution_target_species_key'), new.created_at);
  elsif new.command_type = 'mission_claim' then
    perform server_authority_private.apply_mission_fact(new.auth_user_id, 'mission_claimed',
      jsonb_build_object('missionIndex', new.result -> 'mission_index'), new.created_at);
  end if;
  delete from public.player_mission_pending_item_fact
  where auth_user_id = new.auth_user_id and transaction_id = txid_current();
  return new;
end;
$_$;

CREATE OR REPLACE FUNCTION "server_authority_private"."process_training_command_receipt"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'pg_temp'
    AS $$
declare v_entry jsonb; v_ordinal integer:=0; v_species text;
begin
  if new.command_type='training_terminal_reward' then
    perform server_authority_private.emit_mission_source_event(new,0,'training_victory',jsonb_build_object(
      'difficulty',new.result->>'training_difficulty','teamSizeAtStart',new.result->'training_team_size'));
    perform server_authority_private.apply_training_victory_missions(new.auth_user_id,new.command_id,0);
  elsif new.command_type='training_allocate' then
    for v_entry in select value from jsonb_array_elements(new.result->'level_events') loop
      select species_key into v_species from public.player_pokemon_instance where auth_user_id=new.auth_user_id
        and id=(v_entry->>'pokemonInstanceId')::uuid;
      perform server_authority_private.emit_mission_source_event(new,v_ordinal,'pokemon_level_up',jsonb_build_object(
        'speciesKey',v_species,'levels',v_entry->'levels','source','training'));
      v_ordinal:=v_ordinal+1;
    end loop;
  elsif new.command_type='training_resolve' and new.result->>'evolved_to_species_key' is not null then
    perform server_authority_private.emit_mission_source_event(new,0,'pokemon_evolved',jsonb_build_object(
      'speciesKey',new.result->>'evolved_from_species_key','targetSpeciesKey',new.result->>'evolved_to_species_key','source','training'));
  end if;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION "server_authority_private"."sync_player_missions"("p_auth_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'pg_temp'
    AS $$
declare
  v_catalog_release_id uuid; v_today date:=(now() at time zone 'Europe/Rome')::date;
  v_badges integer; v_dex_count integer;
begin
  select catalog_release_id,least(8,greatest(0,badges)) into v_catalog_release_id,v_badges
  from public.player_profile_state where auth_user_id=p_auth_user_id;
  if v_catalog_release_id is null then return; end if;
  insert into public.player_mission_state(auth_user_id,catalog_release_id,mission_index)
  select p_auth_user_id,mission.catalog_release_id,mission.mission_index
  from public.catalog_mission mission where mission.catalog_release_id=v_catalog_release_id
  on conflict(auth_user_id,mission_index) do nothing;
  if exists(select 1 from public.player_mission_state where auth_user_id=p_auth_user_id
    and catalog_release_id<>v_catalog_release_id) then
    raise exception 'player mission state is bound to a different catalog release' using errcode='55000';
  end if;
  perform server_authority_private.apply_daily_mission_resets(p_auth_user_id,v_today);

  -- Login completion and its badge-scaled reward are frozen once per Rome day.
  update public.player_mission_state state set counter=mission.target,
    tracked_keys=array_append(array_remove(state.tracked_keys,
      (select key from unnest(state.tracked_keys) key where key like 'reward_badges:%' limit 1)),
      'reward_badges:'||v_badges::text),updated_at=now()
  from public.catalog_mission mission
  where state.auth_user_id=p_auth_user_id and state.catalog_release_id=v_catalog_release_id
    and mission.catalog_release_id=state.catalog_release_id and mission.mission_index=state.mission_index
    and mission.mission_type='daily_login' and state.claim_status='unclaimed'
    and state.daily_reset_date=v_today and state.counter<mission.target;

  -- Species missions describe the canonical National PokÃ©dex, not capture
  -- events, so starters, evolutions and reward Pokemon count immediately.
  select count(*)::integer into v_dex_count from public.player_dex_entry
  where auth_user_id=p_auth_user_id and catalog_release_id=v_catalog_release_id;
  update public.player_mission_state state set counter=least(mission.target,v_dex_count),updated_at=now()
  from public.catalog_mission mission
  where state.auth_user_id=p_auth_user_id and state.catalog_release_id=v_catalog_release_id
    and state.claim_status='unclaimed' and mission.catalog_release_id=state.catalog_release_id
    and mission.mission_index=state.mission_index and mission.mission_type='pokedex_species_count'
    and state.counter is distinct from least(mission.target,v_dex_count);
end;
$$;

CREATE OR REPLACE FUNCTION "server_authority_private"."training_battle_inventory"("p_auth_user_id" "uuid", "p_catalog_release_id" "uuid") RETURNS "jsonb"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'server_authority_private', 'pg_temp'
    AS $$
  select coalesce(jsonb_agg(jsonb_build_array(inventory.item_index, inventory.quantity)
    order by inventory.item_index), '[]'::jsonb)
  from public.player_inventory_item inventory
  join public.catalog_item item on item.catalog_release_id = inventory.catalog_release_id
    and item.item_index = inventory.item_index
  where inventory.auth_user_id = p_auth_user_id
    and inventory.catalog_release_id = p_catalog_release_id
    and inventory.quantity > 0
    and (item.category_key = 'battle_item'
      or (item.category_key = 'berry' and item.item_index between 300 and 308));
$$;

CREATE OR REPLACE FUNCTION "public"."validate_battle_shop_catalog_on_publish"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions', 'pg_temp'
    AS $$
declare v_expected integer; v_actual integer;
begin
  if not (old.status='draft' and new.status='published') then return new; end if;
  select sum(row_count)::integer into v_expected from public.catalog_import_batch
  where catalog_release_id=new.id and family_key='battle-shop' and row_count is not null;
  select count(*) into v_actual from public.catalog_import_batch
  where catalog_release_id=new.id and family_key='battle-shop' and row_count is not null;
  if v_actual<>1 or coalesce(v_expected,0)<2
    or (select count(*) from public.catalog_battle_shop_offer where catalog_release_id=new.id)<>v_expected then
    raise exception 'Battle Shop catalog family is incomplete'; end if;
  if not exists(select 1 from public.catalog_battle_shop_offer where catalog_release_id=new.id and offer_key='pokemon_100'
    and offer_kind='pokemon' and battle_point_price=100 and rules @> '{"excludeFossils":true}'::jsonb)
    or not exists(select 1 from public.catalog_battle_shop_offer where catalog_release_id=new.id and offer_key='pokemon_500'
      and offer_kind='pokemon' and battle_point_price=500 and rules @> '{"excludeFossils":false}'::jsonb) then
    raise exception 'Battle Shop Pokemon offers are incomplete'; end if;
  new.checksum:='sha256:'||encode(digest(convert_to(new.checksum||E'\n'||coalesce((select string_agg(
    jsonb_build_array(offer_key,offer_kind,item_index,battle_point_price,sort_order,rules)::text,E'\n' order by offer_key)
    from public.catalog_battle_shop_offer where catalog_release_id=new.id),''),'UTF8'),'sha256'),'hex');
  return new;
end;
$$;


-- Remove the superseded pre-Edge battle API instead of carrying an Italian-key compatibility path.
drop function if exists public.abandon_authoritative_battle(uuid, bigint, uuid, bigint, uuid);
drop function if exists public.submit_authoritative_battle_move(uuid, bigint, uuid, bigint, uuid, integer);
drop function if exists public.switch_authoritative_battle_pokemon(uuid, bigint, uuid, bigint, uuid, integer);
drop function if exists public.start_authoritative_battle(uuid, bigint, text, uuid);
drop function if exists server_authority_private.execute_authoritative_battle_command(text, uuid, bigint, uuid, bigint, uuid, integer);
drop function if exists server_authority_private.authoritative_battle_apply_azione(uuid, text, integer);



do $$ begin

  if exists (select 1 from public.catalog_move where catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and move_key !~ '^[a-z][a-z0-9_]*$') then raise exception 'move key normalization failed'; end if;

  if exists (select 1 from public.catalog_item where catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and item_key !~ '^[a-z][a-z0-9_]*$') then raise exception 'item key normalization failed'; end if;

  if exists (select 1 from public.catalog_type where catalog_release_id = (select id from public.catalog_release where version = 'revival-baseline') and type_key !~ '^[a-z][a-z0-9_]*$') then raise exception 'type key normalization failed'; end if;

end $$;

select server_authority_private.finish_game_data_change();

commit;
