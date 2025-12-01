import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { LayoutAnimation, Platform, Pressable, UIManager, View } from "react-native";

if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface AccordionProps {
    title: React.ReactNode;
    children: React.ReactNode;
    expanded?: boolean;
    onToggle?: () => void;
}

export function Accordion({
    title,
    children,
    expanded: controlledExpanded,
    onToggle: controlledOnToggle,
}: AccordionProps) {
    const [internalExpanded, setInternalExpanded] = useState(false);

    const isExpanded = controlledExpanded ?? internalExpanded;

    const handleToggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (controlledOnToggle) {
            controlledOnToggle();
        } else {
            setInternalExpanded(!internalExpanded);
        }
    };

    return (
        <View className="border-b border-gray-100">
            <Pressable
                onPress={handleToggle}
                className="flex-row items-center justify-between py-1"
            >
                <View className="flex-1">{title}</View>
                <View className="p-2">
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#9CA3AF"
                    />
                </View>
            </Pressable>
            {isExpanded && <View className="pb-4 pl-9 pr-4">{children}</View>}
        </View>
    );
}
