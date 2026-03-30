// Demo mock data — realistic sample data for all screens

export const mockUser = {
  id: "a1000000-0000-0000-0000-000000000001",
  username: "KRUSH",
  display_name: "Krush",
  email: "demo@graffiti.app",
  level: 12,
  xp: 2400,
  spray_cans: 45,
  crew_id: "c1000000-0000-0000-0000-000000000001",
  avatar_url: null,
  is_banned: false,
  created_at: "2026-03-01T00:00:00Z",
  last_tagged_at: "2026-03-30T08:15:00Z",
  role: "user",
  banned_until: null,
  ban_reason: null,
};

export const mockSession = {
  access_token: "demo-token",
  token_type: "bearer",
  user: {
    id: mockUser.id,
    email: mockUser.email,
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: mockUser.created_at,
  },
};

export const mockCrew = {
  id: "c1000000-0000-0000-0000-000000000001",
  name: "Kings of Austin",
  abbreviation: "KOA",
  color: "#FF4136",
  founder_id: mockUser.id,
  member_count: 5,
  created_at: "2026-03-01T00:00:00Z",
};

export const mockCrewMembers = [
  { userId: mockUser.id, username: "KRUSH", role: "og", joinedAt: "2026-03-01T00:00:00Z" },
  { userId: "a1000000-0000-0000-0000-000000000002", username: "VENOM", role: "member", joinedAt: "2026-03-05T00:00:00Z" },
  { userId: "a1000000-0000-0000-0000-000000000003", username: "BLAZE", role: "member", joinedAt: "2026-03-10T00:00:00Z" },
  { userId: "a1000000-0000-0000-0000-000000000004", username: "NOVA", role: "member", joinedAt: "2026-03-12T00:00:00Z" },
  { userId: "a1000000-0000-0000-0000-000000000006", username: "PHANTOM", role: "member", joinedAt: "2026-03-15T00:00:00Z" },
];

export const mockTags = [
  { id: "t1", latitude: 30.2672, longitude: -97.7431, crewColor: "#FF4136", crewAbbreviation: "KOA", userId: mockUser.id, zoneId: "z1", tagImageId: "img1", status: "active", createdAt: "2026-03-30T08:00:00Z" },
  { id: "t2", latitude: 30.2680, longitude: -97.7440, crewColor: "#FF4136", crewAbbreviation: "KOA", userId: mockUser.id, zoneId: "z1", tagImageId: "img2", status: "active", createdAt: "2026-03-30T07:30:00Z" },
  { id: "t3", latitude: 30.2665, longitude: -97.7420, crewColor: "#0074D9", crewAbbreviation: "SHW", userId: "u2", zoneId: "z2", tagImageId: "img1", status: "active", createdAt: "2026-03-30T06:00:00Z" },
  { id: "t4", latitude: 30.2690, longitude: -97.7450, crewColor: "#0074D9", crewAbbreviation: "SHW", userId: "u3", zoneId: "z2", tagImageId: "img3", status: "active", createdAt: "2026-03-29T22:00:00Z" },
  { id: "t5", latitude: 30.2655, longitude: -97.7410, crewColor: "#FF4136", crewAbbreviation: "KOA", userId: mockUser.id, zoneId: "z3", tagImageId: "img2", status: "active", createdAt: "2026-03-29T20:00:00Z" },
  { id: "t6", latitude: 30.2700, longitude: -97.7460, crewColor: "#2ECC40", crewAbbreviation: "GHZ", userId: "u4", zoneId: "z4", tagImageId: "img1", status: "active", createdAt: "2026-03-29T18:00:00Z" },
  { id: "t7", latitude: 30.2645, longitude: -97.7425, crewColor: "#FF4136", crewAbbreviation: "KOA", userId: "u5", zoneId: "z1", tagImageId: "img3", status: "active", createdAt: "2026-03-29T15:00:00Z" },
  { id: "t8", latitude: 30.2675, longitude: -97.7445, crewColor: "#B10DC9", crewAbbreviation: "NXT", userId: "u6", zoneId: "z5", tagImageId: "img2", status: "active", createdAt: "2026-03-29T12:00:00Z" },
];

export const mockZones = [
  {
    id: "z1", name: "6th Street", controllingCrewId: "c1000000-0000-0000-0000-000000000001", controllingCrewColor: "#FF4136", controllingCrewAbbreviation: "KOA",
    coordinates: [
      { latitude: 30.2680, longitude: -97.7450 },
      { latitude: 30.2680, longitude: -97.7420 },
      { latitude: 30.2660, longitude: -97.7420 },
      { latitude: 30.2660, longitude: -97.7450 },
    ],
  },
  {
    id: "z2", name: "Rainey Street", controllingCrewId: "c2", controllingCrewColor: "#0074D9", controllingCrewAbbreviation: "SHW",
    coordinates: [
      { latitude: 30.2660, longitude: -97.7420 },
      { latitude: 30.2660, longitude: -97.7400 },
      { latitude: 30.2640, longitude: -97.7400 },
      { latitude: 30.2640, longitude: -97.7420 },
    ],
  },
  {
    id: "z3", name: "Congress Ave", controllingCrewId: "c1000000-0000-0000-0000-000000000001", controllingCrewColor: "#FF4136", controllingCrewAbbreviation: "KOA",
    coordinates: [
      { latitude: 30.2660, longitude: -97.7450 },
      { latitude: 30.2660, longitude: -97.7430 },
      { latitude: 30.2640, longitude: -97.7430 },
      { latitude: 30.2640, longitude: -97.7450 },
    ],
  },
  {
    id: "z4", name: "East Side", controllingCrewId: null, controllingCrewColor: null, controllingCrewAbbreviation: null,
    coordinates: [
      { latitude: 30.2710, longitude: -97.7470 },
      { latitude: 30.2710, longitude: -97.7450 },
      { latitude: 30.2690, longitude: -97.7450 },
      { latitude: 30.2690, longitude: -97.7470 },
    ],
  },
  {
    id: "z5", name: "SoCo", controllingCrewId: "c3", controllingCrewColor: "#B10DC9", controllingCrewAbbreviation: "NXT",
    coordinates: [
      { latitude: 30.2640, longitude: -97.7470 },
      { latitude: 30.2640, longitude: -97.7450 },
      { latitude: 30.2620, longitude: -97.7450 },
      { latitude: 30.2620, longitude: -97.7470 },
    ],
  },
];

export const mockActivityFeed = [
  { id: "f1", event_type: "tag_placed", actor_id: mockUser.id, crew_id: mockCrew.id, zone_id: "z1", created_at: "2026-03-30T08:00:00Z", metadata: { tag_category: "tag" }, actor_username: "KRUSH", crew_name: "Kings of Austin", zone_name: "6th Street" },
  { id: "f2", event_type: "zone_flipped", actor_id: mockUser.id, crew_id: mockCrew.id, zone_id: "z3", created_at: "2026-03-30T07:45:00Z", metadata: { from_crew: "SHW", to_crew: "KOA" }, actor_username: "KRUSH", crew_name: "Kings of Austin", zone_name: "Congress Ave" },
  { id: "f3", event_type: "tag_placed", actor_id: "u2", crew_id: "c2", zone_id: "z2", created_at: "2026-03-30T07:30:00Z", metadata: { tag_category: "throwup" }, actor_username: "VENOM", crew_name: "Shadow Writers", zone_name: "Rainey Street" },
  { id: "f4", event_type: "tag_gone_over", actor_id: "u3", crew_id: "c2", zone_id: "z1", created_at: "2026-03-30T07:00:00Z", metadata: { original_user: mockUser.id }, actor_username: "BLAZE", crew_name: "Shadow Writers", zone_name: "6th Street" },
  { id: "f5", event_type: "crew_joined", actor_id: "u6", crew_id: "c3", zone_id: null, created_at: "2026-03-30T06:30:00Z", metadata: { crew_name: "NXT LVL" }, actor_username: "PHANTOM", crew_name: "NXT LVL", zone_name: null },
  { id: "f6", event_type: "tag_placed", actor_id: "u4", crew_id: "c3", zone_id: "z5", created_at: "2026-03-30T06:00:00Z", metadata: { tag_category: "piece" }, actor_username: "NOVA", crew_name: "NXT LVL", zone_name: "SoCo" },
  { id: "f7", event_type: "level_up", actor_id: mockUser.id, crew_id: mockCrew.id, zone_id: null, created_at: "2026-03-30T05:30:00Z", metadata: { new_level: 12 }, actor_username: "KRUSH", crew_name: "Kings of Austin", zone_name: null },
  { id: "f8", event_type: "zone_flipped", actor_id: "u3", crew_id: "c2", zone_id: "z2", created_at: "2026-03-30T05:00:00Z", metadata: { from_crew: "KOA", to_crew: "SHW" }, actor_username: "BLAZE", crew_name: "Shadow Writers", zone_name: "Rainey Street" },
  { id: "f9", event_type: "tag_placed", actor_id: mockUser.id, crew_id: mockCrew.id, zone_id: "z1", created_at: "2026-03-30T04:30:00Z", metadata: { tag_category: "tag" }, actor_username: "KRUSH", crew_name: "Kings of Austin", zone_name: "6th Street" },
  { id: "f10", event_type: "tag_placed", actor_id: "u5", crew_id: "c1000000-0000-0000-0000-000000000001", zone_id: "z3", created_at: "2026-03-30T04:00:00Z", metadata: { tag_category: "stencil" }, actor_username: "SOLO_RIDER", crew_name: "Kings of Austin", zone_name: "Congress Ave" },
];

export const mockTopUsers = [
  { id: mockUser.id, username: "KRUSH", level: 12, xp: 2400, tag_count: 87 },
  { id: "u2", username: "VENOM", level: 8, xp: 1200, tag_count: 54 },
  { id: "u3", username: "BLAZE", level: 15, xp: 3800, tag_count: 112 },
  { id: "u4", username: "NOVA", level: 6, xp: 800, tag_count: 32 },
  { id: "u5", username: "SOLO_RIDER", level: 10, xp: 1800, tag_count: 65 },
  { id: "u6", username: "PHANTOM", level: 5, xp: 600, tag_count: 21 },
  { id: "u7", username: "CIPHER", level: 14, xp: 3200, tag_count: 98 },
  { id: "u8", username: "DRIP", level: 11, xp: 2100, tag_count: 76 },
  { id: "u9", username: "ZENITH", level: 9, xp: 1500, tag_count: 48 },
  { id: "u10", username: "WRAITH", level: 7, xp: 950, tag_count: 38 },
];

export const mockTopCrews = [
  { id: mockCrew.id, name: "Kings of Austin", abbreviation: "KOA", color: "#FF4136", member_count: 5, total_xp: 8800, zones_controlled: 2 },
  { id: "c2", name: "Shadow Writers", abbreviation: "SHW", color: "#0074D9", member_count: 4, total_xp: 6200, zones_controlled: 1 },
  { id: "c3", name: "NXT LVL", abbreviation: "NXT", color: "#B10DC9", member_count: 3, total_xp: 3400, zones_controlled: 1 },
  { id: "c4", name: "Ghost Haze", abbreviation: "GHZ", color: "#2ECC40", member_count: 6, total_xp: 5100, zones_controlled: 0 },
  { id: "c5", name: "Ink Lords", abbreviation: "INK", color: "#FF851B", member_count: 2, total_xp: 1800, zones_controlled: 0 },
];

export const mockMissions = [
  { id: "m1", title: "Tag 3 Spots", description: "Place 3 tags anywhere in the city.", type: "daily", requirements: { action: "place_tags", count: 3 }, reward_xp: 50, reward_spray: 0, starts_at: "2026-03-30T00:00:00Z", expires_at: "2026-03-31T00:00:00Z", progress: 2, completed: false, claimed: false },
  { id: "m2", title: "Zone Raider", description: "Flip 2 zones to your crew.", type: "daily", requirements: { action: "zone_flip", count: 2 }, reward_xp: 75, reward_spray: 1, starts_at: "2026-03-30T00:00:00Z", expires_at: "2026-03-31T00:00:00Z", progress: 1, completed: false, claimed: false },
  { id: "m3", title: "Tag Blitz", description: "Drop 10 tags in a single day.", type: "daily", requirements: { action: "place_tags", count: 10 }, reward_xp: 150, reward_spray: 2, starts_at: "2026-03-30T00:00:00Z", expires_at: "2026-03-31T00:00:00Z", progress: 0, completed: false, claimed: false },
  { id: "m4", title: "Zone Dominator", description: "Flip 10 zones this week.", type: "weekly", requirements: { action: "zone_flip", count: 10 }, reward_xp: 500, reward_spray: 5, starts_at: "2026-03-24T00:00:00Z", expires_at: "2026-03-31T00:00:00Z", progress: 6, completed: false, claimed: false },
];

export const mockSeason = {
  id: "s1",
  name: "Spring 2026",
  starts_at: "2026-03-01T00:00:00Z",
  ends_at: "2026-04-01T00:00:00Z",
  status: "active",
  config: {},
};

export const mockTagHistory = [
  { id: "t1", tag_image_name: "Classic Tag", zone_name: "6th Street", created_at: "2026-03-30T08:00:00Z" },
  { id: "t2", tag_image_name: "Throw-up", zone_name: "6th Street", created_at: "2026-03-30T07:30:00Z" },
  { id: "t5", tag_image_name: "Wildstyle", zone_name: "Congress Ave", created_at: "2026-03-29T20:00:00Z" },
  { id: "t7", tag_image_name: "Classic Tag", zone_name: "6th Street", created_at: "2026-03-29T15:00:00Z" },
];

export const mockTagImages = [
  { id: "img1", name: "Classic Tag", image_url: null, preview_color: "#FF4136" },
  { id: "img2", name: "Throw-up", image_url: null, preview_color: "#0074D9" },
  { id: "img3", name: "Wildstyle", image_url: null, preview_color: "#2ECC40" },
  { id: "img4", name: "Stencil", image_url: null, preview_color: "#B10DC9" },
  { id: "img5", name: "Piece", image_url: null, preview_color: "#FF851B" },
];
