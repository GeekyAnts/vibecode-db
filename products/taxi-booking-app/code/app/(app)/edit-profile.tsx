import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import {
  ArrowLeft,
  Camera,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Check,
} from "lucide-react-native";
import { useTheme } from "../../src/hooks";

cssInterop(ArrowLeft, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Camera, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(User, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Mail, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Phone, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(MapPin, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Calendar, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});
cssInterop(Check, {
  className: { target: "style", nativeStyleToProp: { color: true } },
});

interface FormField {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  icon: any;
  keyboardType?: "default" | "email-address" | "phone-pad";
  editable?: boolean;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, Downtown",
    dateOfBirth: "January 15, 1990",
  });

  const handleSave = () => {
    // Save profile logic here
    router.back();
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formFields: FormField[] = [
    {
      id: "firstName",
      label: "First Name",
      value: formData.firstName,
      placeholder: "Enter first name",
      icon: User,
    },
    {
      id: "lastName",
      label: "Last Name",
      value: formData.lastName,
      placeholder: "Enter last name",
      icon: User,
    },
    {
      id: "email",
      label: "Email",
      value: formData.email,
      placeholder: "Enter email",
      icon: Mail,
      keyboardType: "email-address",
      editable: false,
    },
    {
      id: "phone",
      label: "Phone Number",
      value: formData.phone,
      placeholder: "Enter phone number",
      icon: Phone,
      keyboardType: "phone-pad",
    },
    {
      id: "address",
      label: "Address",
      value: formData.address,
      placeholder: "Enter address",
      icon: MapPin,
    },
    {
      id: "dateOfBirth",
      label: "Date of Birth",
      value: formData.dateOfBirth,
      placeholder: "Enter date of birth",
      icon: Calendar,
    },
  ];

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4">
            <Pressable
              onPress={() => router.back()}
              className="h-11 w-11 items-center justify-center rounded-2xl bg-card"
            >
              <ArrowLeft color={isDark ? "#fff" : "#000"} size={22} />
            </Pressable>
            <Text className="text-xl font-bold text-foreground">Edit Profile</Text>
            <View className="w-11" />
          </View>

          <ScrollView
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Photo Section */}
            <View className="items-center py-6">
              <View className="relative">
                <View className="h-28 w-28 items-center justify-center rounded-3xl bg-primary">
                  <User color="#000" size={56} />
                </View>
                <Pressable className="absolute -bottom-2 -right-2 h-10 w-10 items-center justify-center rounded-full bg-card border-4 border-background">
                  <Camera color="#FACC15" size={18} />
                </Pressable>
              </View>
              <Text className="mt-4 text-lg font-bold text-foreground">
                {formData.firstName} {formData.lastName}
              </Text>
              <Text className="mt-1 text-muted-foreground">Tap photo to change</Text>
            </View>

            {/* Form Fields */}
            <View className="px-5">
              <Text className="mb-4 text-sm font-semibold text-muted-foreground">
                PERSONAL INFORMATION
              </Text>

              <View className="gap-4">
                {formFields.map((field) => {
                  const Icon = field.icon;
                  const isEditable = field.editable !== false;
                  return (
                    <View key={field.id}>
                      <Text className="mb-2 text-sm font-medium text-muted-foreground">
                        {field.label}
                      </Text>
                      <View
                        className={`flex-row items-center rounded-2xl px-4 py-1 ${
                          isEditable ? "bg-card" : "bg-card/50"
                        }`}
                      >
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                          <Icon color="#FACC15" size={20} />
                        </View>
                        <TextInput
                          value={field.value}
                          onChangeText={(text) => updateField(field.id, text)}
                          placeholder={field.placeholder}
                          keyboardType={field.keyboardType || "default"}
                          editable={isEditable}
                          className={`ml-3 flex-1 py-4 text-base ${
                            isEditable ? "text-foreground" : "text-muted-foreground"
                          }`}
                          placeholderTextColor={isDark ? "#525252" : "#a3a3a3"}
                        />
                        {!isEditable && (
                          <View className="rounded-full bg-muted px-2 py-1">
                            <Text className="text-xs text-muted-foreground">Verified</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Additional Options */}
              <View className="mt-8">
                <Text className="mb-4 text-sm font-semibold text-muted-foreground">
                  ACCOUNT ACTIONS
                </Text>

                <View className="gap-3">
                  <Pressable className="flex-row items-center rounded-2xl bg-card p-4">
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                      <Mail color="#3B82F6" size={20} />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="font-semibold text-foreground">
                        Change Email
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        Update your email address
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable className="flex-row items-center rounded-2xl bg-card p-4">
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                      <Phone color="#22C55E" size={20} />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="font-semibold text-foreground">
                        Verify Phone
                      </Text>
                      <Text className="text-sm text-muted-foreground">
                        Verify your phone number
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-5 pb-10 pt-4">
            <Pressable onPress={handleSave} className="overflow-hidden rounded-2xl">
              <LinearGradient
                colors={["#FACC15", "#EAB308"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Check color="#000" size={22} strokeWidth={3} />
                <Text className="text-lg font-black text-black">Save Changes</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
