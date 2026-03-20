import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import { ArrowLeft } from "lucide-react-native";

cssInterop(ArrowLeft, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});

const OTP_LENGTH = 6;

export default function OTPScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (canResend) {
      setTimer(30);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(""));
    }
  };

  const handleVerify = () => {
    const otpValue = otp.join("");
    if (otpValue.length === OTP_LENGTH) {
      router.push("/(onboarding)/profile-setup");
    }
  };

  const isComplete = otp.every((digit) => digit !== "");

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6">
        {/* Header */}
        <Pressable
          onPress={() => router.back()}
          className="mt-4 h-10 w-10 items-center justify-center rounded-full bg-muted"
        >
          <ArrowLeft className="text-foreground" size={24} />
        </Pressable>

        {/* Title Section */}
        <View className="mt-8">
          <Text className="text-2xl font-bold text-foreground">
            Verify your email
          </Text>
          <Text className="mt-2 text-muted-foreground">
            Enter the 6-digit code sent to
          </Text>
          <Text className="mt-1 font-medium text-foreground">
            r***@gmail.com
          </Text>
        </View>

        {/* OTP Input Boxes */}
        <View className="mt-10 flex-row justify-between">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              className={`h-14 w-12 rounded-xl border-2 text-center text-xl font-bold text-foreground ${
                digit
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background"
              }`}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Resend Section */}
        <View className="mt-8 flex-row items-center justify-center">
          <Text className="text-muted-foreground">Didn't receive code? </Text>
          {canResend ? (
            <Pressable onPress={handleResend}>
              <Text className="font-semibold text-primary">Resend Code</Text>
            </Pressable>
          ) : (
            <Text className="font-medium text-foreground">
              00:{timer.toString().padStart(2, "0")}
            </Text>
          )}
        </View>

        {/* Verify Button */}
        <Pressable
          onPress={handleVerify}
          disabled={!isComplete}
          className={`mt-auto mb-8 rounded-xl py-4 ${
            isComplete ? "bg-primary active:opacity-80" : "bg-muted"
          }`}
        >
          <Text
            className={`text-center text-lg font-semibold ${
              isComplete ? "text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Verify
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
