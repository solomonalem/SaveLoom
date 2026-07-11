import { SymbolView } from "expo-symbols";
import { Tabs } from "expo-router";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerStyle: { backgroundColor: "#eef2ff" },
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: "house.fill", android: "home", web: "home" }} tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: "Accounts",
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: "creditcard.fill", android: "credit_card", web: "credit_card" }} tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: "list.bullet.rectangle", android: "receipt_long", web: "receipt_long" }} tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: "sparkles", android: "auto_awesome", web: "auto_awesome" }} tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: "Plan",
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: "chart.pie.fill", android: "pie_chart", web: "pie_chart" }} tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: "ellipsis.circle.fill", android: "more_horiz", web: "more_horiz" }} tintColor={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
