import React from "react";
import { render } from "@testing-library/react-native";
import { AchievementCard } from "@/components/profile/achievement-card";
import type { Achievement } from "@/stores/achievement-store";

const unlockedAchievement: Achievement = {
  id: "a1",
  name: "First Tag",
  description: "Place your first tag",
  icon: "🎨",
  category: "tagging",
  requirement_type: "tags_placed",
  requirement_value: 1,
  reward_xp: 50,
  reward_spray: 5,
  rarity: "common",
  unlocked: true,
  unlocked_at: "2026-03-30T00:00:00Z",
};

const lockedAchievement: Achievement = {
  id: "a2",
  name: "Legend",
  description: "Place 500 tags",
  icon: "👑",
  category: "tagging",
  requirement_type: "tags_placed",
  requirement_value: 500,
  reward_xp: 2000,
  reward_spray: 50,
  rarity: "epic",
  unlocked: false,
  unlocked_at: null,
};

describe("AchievementCard", () => {
  it("renders unlocked achievement with check mark", () => {
    const { getByText } = render(
      <AchievementCard achievement={unlockedAchievement} />
    );
    expect(getByText("First Tag")).toBeTruthy();
    expect(getByText("Place your first tag")).toBeTruthy();
    expect(getByText("🎨")).toBeTruthy();
    expect(getByText("✓")).toBeTruthy();
    expect(getByText("+50 XP")).toBeTruthy();
    expect(getByText("+5 Spray")).toBeTruthy();
  });

  it("renders locked achievement without check mark", () => {
    const { getByText, queryByText } = render(
      <AchievementCard achievement={lockedAchievement} />
    );
    expect(getByText("Legend")).toBeTruthy();
    expect(getByText("Place 500 tags")).toBeTruthy();
    expect(getByText("EPIC")).toBeTruthy();
    expect(queryByText("✓")).toBeNull();
  });

  it("shows correct rarity label", () => {
    const { getByText } = render(
      <AchievementCard achievement={unlockedAchievement} />
    );
    expect(getByText("COMMON")).toBeTruthy();
  });
});
