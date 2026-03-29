import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  FlatList,
  ViewToken,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface Slide {
  title: string;
  subtitle: string;
  color: string;
  icon: string;
}

const SLIDES: Slide[] = [
  {
    title: "Tag the World",
    subtitle: "Drop AR graffiti tags anywhere. Your city is your canvas.",
    color: "#4ecdc4",
    icon: "SPRAY",
  },
  {
    title: "Claim Territory",
    subtitle: "Control zones with your crew. The more tags, the stronger your hold.",
    color: "#ff6b6b",
    icon: "FLAG",
  },
  {
    title: "Build Your Crew",
    subtitle: "Team up, compete on leaderboards, and dominate the map.",
    color: "#ffd93d",
    icon: "CREW",
  },
];

interface WelcomeCarouselProps {
  onComplete: () => void;
}

export function WelcomeCarousel({ onComplete }: WelcomeCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const progress = useSharedValue(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
        progress.value = withTiming(viewableItems[0].index, { duration: 200 });
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.iconBox, { backgroundColor: item.color }]}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.skipButton}
        onPress={onComplete}
        testID="skip-button"
      >
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        testID="carousel-list"
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <Dot key={i} index={i} currentIndex={currentIndex} />
          ))}
        </View>

        <Pressable
          style={[
            styles.nextButton,
            isLastSlide && styles.getStartedButton,
          ]}
          onPress={handleNext}
          testID={isLastSlide ? "get-started-button" : "next-button"}
        >
          <Text style={styles.nextText}>
            {isLastSlide ? "Get Started" : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Dot({ index, currentIndex }: { index: number; currentIndex: number }) {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: index === currentIndex ? "#4ecdc4" : "#555",
    width: index === currentIndex ? 24 : 8,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d1a",
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    color: "#888",
    fontSize: 16,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconBox: {
    width: 120,
    height: 120,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  iconText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0d0d1a",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: "center",
    gap: 24,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    backgroundColor: "#4ecdc4",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
  },
  getStartedButton: {
    backgroundColor: "#4ecdc4",
    paddingHorizontal: 60,
  },
  nextText: {
    color: "#0d0d1a",
    fontSize: 18,
    fontWeight: "bold",
  },
});
