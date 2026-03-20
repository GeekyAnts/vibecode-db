import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  withRepeat,
} from "react-native-reanimated";
import { cssInterop } from "nativewind";
import { Car, MapPin } from "lucide-react-native";

cssInterop(Car, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(MapPin, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});

export default function SplashScreen() {
  const router = useRouter();

  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const pulseScale = useSharedValue(1);
  const carTranslateX = useSharedValue(-100);

  useEffect(() => {
    // Logo animation
    logoOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withSequence(
      withTiming(1.1, { duration: 400, easing: Easing.out(Easing.back) }),
      withTiming(1, { duration: 200 })
    );

    // Text animation
    textOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    textTranslateY.value = withDelay(
      400,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) })
    );

    // Pulse animation
    pulseScale.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1
      )
    );

    // Car animation
    carTranslateX.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(100, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(-100, { duration: 0 })
        ),
        -1
      )
    );

    // Navigate after splash
    const timer = setTimeout(() => {
      router.replace("/(onboarding)/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  const carStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: carTranslateX.value }],
  }));

  return (
    <View className="flex-1 bg-black">
      {/* Gradient Background */}
      <LinearGradient
        colors={["#0A0A0A", "#171717", "#0A0A0A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        {/* Yellow accent circles */}
        <View className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-yellow-400/10" />
        <View className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-yellow-400/5" />

        <View className="flex-1 items-center justify-center px-8">
          {/* Logo Container */}
          <Animated.View style={logoStyle} className="items-center">
            {/* Pulse ring */}
            <Animated.View
              style={pulseStyle}
              className="absolute h-36 w-36 rounded-full border-2 border-yellow-400/30"
            />

            {/* Main logo */}
            <View className="h-32 w-32 items-center justify-center rounded-3xl bg-yellow-400">
              <Car color="#0A0A0A" size={64} strokeWidth={2.5} />
            </View>
          </Animated.View>

          {/* App Name */}
          <Animated.View style={textStyle} className="mt-8 items-center">
            <Text className="text-5xl font-black tracking-tight text-white">
              Ride<Text className="text-yellow-400">Now</Text>
            </Text>
            <Text className="mt-3 text-lg tracking-widest text-white/50">
              YOUR RIDE, YOUR WAY
            </Text>
          </Animated.View>

          {/* Animated car line */}
          <View className="mt-16 h-1 w-64 overflow-hidden rounded-full bg-white/10">
            <Animated.View
              style={carStyle}
              className="h-full w-8 rounded-full bg-yellow-400"
            />
          </View>
        </View>

        {/* Bottom decoration */}
        <View className="absolute bottom-12 left-0 right-0 items-center">
          <View className="flex-row items-center gap-2">
            <View className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
            <View className="h-1.5 w-8 rounded-full bg-yellow-400/50" />
            <View className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
