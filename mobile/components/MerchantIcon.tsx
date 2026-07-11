import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import {
  getMerchantDisplayName,
  getMerchantLogoUrl,
  resolveBankDomain,
  resolveMerchantDomain,
} from "@/lib/merchant-icons";

interface MerchantIconProps {
  merchantName?: string | null;
  description?: string | null;
  category: string;
  bankName?: string | null;
  size?: number;
}

function categoryInitial(category: string): string {
  const label = category.replace(/_/g, " ").trim();
  return label.charAt(0).toUpperCase() || "?";
}

export default function MerchantIcon({
  merchantName,
  description,
  category,
  bankName,
  size = 42,
}: MerchantIconProps) {
  const domain =
    resolveBankDomain(bankName) ?? resolveMerchantDomain(merchantName, description);
  const [failed, setFailed] = useState(false);
  const label = getMerchantDisplayName(merchantName, description);
  const radius = Math.round(size * 0.28);

  if (!domain || failed) {
    return (
      <View style={[styles.fallback, { width: size, height: size, borderRadius: radius }]}>
        <Text style={[styles.fallbackText, { fontSize: size * 0.32 }]}>
          {categoryInitial(category)}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.logoBox, { width: size, height: size, borderRadius: radius }]}
      accessibilityLabel={label}
    >
      <Image
        source={{ uri: getMerchantLogoUrl(domain, 128) }}
        style={styles.logo}
        resizeMode="contain"
        onError={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.35)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "78%",
    height: "78%",
  },
  fallback: {
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackText: {
    fontWeight: "700",
    color: "#64748b",
  },
});
