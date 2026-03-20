import { useEffect } from "react";
import { View, Text, Dimensions } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "react-native-css-interop";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { GraduationCap } from "lucide-react-native";

const StyledLinearGradient = cssInterop(LinearGradient, {
  className: "style",
});

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.5);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(20);

  useEffect(() => {
    // Icon animation
    iconOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
    iconScale.value = withSequence(
      withTiming(1.1, { duration: 400, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 200, easing: Easing.inOut(Easing.cubic) })
    );

    // Title animation
    titleOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
    titleTranslateY.value = withDelay(
      300,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

    // Tagline animation
    taglineOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
    taglineTranslateY.value = withDelay(
      600,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

    // Navigate to login after 2 seconds
    const timeout = setTimeout(() => {
      router.replace("/(onboarding)/login");
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  return (
    <StyledLinearGradient
      colors={["#6366F1", "#4F46E5"]}
      className="flex-1 items-center justify-center"
    >
      {/* Icon Container */}
      <Animated.View
        style={iconAnimatedStyle}
        className="mb-6 h-28 w-28 items-center justify-center rounded-3xl bg-white/20"
      >
        <GraduationCap size={64} color="#FFFFFF" strokeWidth={1.5} />
      </Animated.View>

      {/* App Name */}
      <Animated.Text
        style={titleAnimatedStyle}
        className="text-4xl font-bold tracking-tight text-white"
      >
        LearnHub
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text
        style={taglineAnimatedStyle}
        className="mt-3 text-lg text-white/80"
      >
        Your learning journey starts here
      </Animated.Text>

      {/* Bottom decoration dots */}
      <View className="absolute bottom-16 flex-row items-center gap-2">
        <View className="h-2 w-2 rounded-full bg-white/40" />
        <View className="h-2 w-8 rounded-full bg-white/80" />
        <View className="h-2 w-2 rounded-full bg-white/40" />
      </View>
    </StyledLinearGradient>
  );
}
