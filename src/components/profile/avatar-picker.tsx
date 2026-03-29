import { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../stores/auth-store";

export function AvatarPicker() {
  const profile = useAuthStore((s) => s.profile);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const [uploading, setUploading] = useState(false);

  const avatarUrl = profile?.avatar_url;
  const initial = (profile?.username ?? "?")[0].toUpperCase();

  async function pickAndUpload() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    const uri = result.assets[0].uri;
    const ext = uri.split(".").pop() ?? "jpg";
    const filePath = `${profile!.id}/avatar.${ext}`;

    const response = await fetch(uri);
    const blob = await response.blob();

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, blob, { upsert: true });

    if (uploadError) {
      setUploading(false);
      Alert.alert("Upload failed", uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    await supabase.rpc("update_profile", {
      p_avatar_url: publicUrl,
    });

    await fetchProfile();
    setUploading(false);
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={pickAndUpload} disabled={uploading}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.initial}>{initial}</Text>
          </View>
        )}
        {uploading ? (
          <ActivityIndicator style={styles.editBadge} color="#4ecdc4" />
        ) : (
          <View style={styles.editBadge}>
            <Text style={styles.editText}>Edit</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4ecdc4",
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2a2a4a",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  editText: {
    color: "#4ecdc4",
    fontSize: 12,
    fontWeight: "bold",
  },
});
