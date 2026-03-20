import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { ShieldCheck, ArrowLeft } from "lucide-react-native";
import { vibecode } from "../../src/db/client";

const OTP_LENGTH = 6;

export default function OTPScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChangeText = (text: string, index: number) => {
    setError(null);

    // Handle paste (multiple characters)
    if (text.length > 1) {
      const digits = text.replace(/\D/g, "").slice(0, OTP_LENGTH);
      const newCode = [...code];
      for (let i = 0; i < digits.length && index + i < OTP_LENGTH; i++) {
        newCode[index + i] = digits[i];
      }
      setCode(newCode);

      // Focus the next empty input or the last one
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();

      // Auto-submit if all filled
      if (newCode.every((d) => d !== "")) {
        handleVerify(newCode.join(""));
      }
      return;
    }

    // Single character input
    const digit = text.replace(/\D/g, "");
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all filled
    if (newCode.every((d) => d !== "")) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace") {
      if (code[index] === "" && index > 0) {
        // Move to previous input and clear it
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const finalCode = otpCode || code.join("");
    if (finalCode.length !== OTP_LENGTH) {
      setError("Please enter the complete verification code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: verifyError } = await vibecode.auth.verifyOtp({
        email: email || "",
        token: finalCode,
        type: "email",
      });
      if (verifyError) throw new Error(verifyError.message);

      if (data?.user) {
        (globalThis as any).__setAuthUser?.(data.user);
      }

      router.replace("/(app)/home");
    } catch (err: any) {
      setError(err.message || "Verification failed");
      // Clear the code on error
      setCode(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResendTimer(30);
    setError(null);

    try {
      const { error: resendError } = await vibecode.auth.resend({
        email: email || "",
        type: "signup",
      });
      if (resendError) throw new Error(resendError.message);
      Alert.alert("Code Sent", "A new verification code has been sent to your email.");
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 px-8">
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          className="mt-14 mb-6 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
        >
          <ArrowLeft size={20} color="#374151" strokeWidth={2} />
        </Pressable>

        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} className="mb-8">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
            <ShieldCheck size={32} color="#6366F1" strokeWidth={1.5} />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            Verify your email
          </Text>
          <Text className="mt-2 text-base text-gray-500">
            We sent a 6-digit code to{" "}
            <Text className="font-medium text-gray-700">
              {email || "your email"}
            </Text>
          </Text>
        </Animated.View>

        {/* Error */}
        {error && (
          <Animated.View
            entering={FadeInUp.duration(300)}
            className="mb-4 rounded-xl bg-red-50 p-3"
          >
            <Text className="text-center text-sm text-red-600">{error}</Text>
          </Animated.View>
        )}

        {/* OTP Inputs */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(200)}
          className="mb-8 flex-row justify-between"
        >
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              className={`h-14 w-12 rounded-xl border-2 text-center text-xl font-bold ${
                digit
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 bg-gray-50 text-gray-900"
              }`}
              value={digit}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              maxLength={index === 0 ? OTP_LENGTH : 1}
              selectTextOnFocus
              textContentType="oneTimeCode"
              autoComplete={index === 0 ? "sms-otp" : "off"}
            />
          ))}
        </Animated.View>

        {/* Verify Button */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          <Pressable
            onPress={() => handleVerify()}
            disabled={loading || code.some((d) => d === "")}
            className={`items-center rounded-xl py-4 ${
              code.every((d) => d !== "")
                ? "bg-indigo-600 active:bg-indigo-700"
                : "bg-gray-200"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                className={`text-base font-semibold ${
                  code.every((d) => d !== "")
                    ? "text-white"
                    : "text-gray-400"
                }`}
              >
                Verify Code
              </Text>
            )}
          </Pressable>
        </Animated.View>

        {/* Resend */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(400)}
          className="mt-6 flex-row items-center justify-center"
        >
          <Text className="text-sm text-gray-500">
            Didn't receive the code?{" "}
          </Text>
          {resendTimer > 0 ? (
            <Text className="text-sm font-medium text-gray-400">
              Resend in {resendTimer}s
            </Text>
          ) : (
            <Pressable onPress={handleResend}>
              <Text className="text-sm font-semibold text-indigo-600">
                Resend
              </Text>
            </Pressable>
          )}
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}
