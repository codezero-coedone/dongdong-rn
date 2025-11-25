import { useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// 카로셀 콘텐츠 타입
interface CarouselItem {
  id: string;
  title: string;
  description: string;
  showImage: boolean;
}

// 온보딩 데이터
const ONBOARDING_DATA: CarouselItem[] = [
  {
    id: "1",
    title: "온보딩 내용 1",
    description: "내용 1에 들어갈\n설명이 들어갑니다.",
    showImage: true,
  },
  {
    id: "2",
    title: "온보딩 내용 2",
    description: "내용 2에 들어갈\n설명이 들어갑니다.",
    showImage: true,
  },
  {
    id: "3",
    title: "온보딩 내용 3",
    description: "내용 3에 들어갈\n설명이 들어갑니다.",
    showImage: false,
  },
];

// 카로셀 아이템 컴포넌트
function CarouselItemView({ item }: { item: CarouselItem }) {
  return (
    <View className="flex-1 items-center pt-8 px-6">
      {/* 제목 */}
      <Text className="text-2xl font-bold text-gray-900 mb-4">
        {item.title}
      </Text>

      {/* 설명 */}
      <Text className="text-base text-gray-500 text-center leading-6 mb-8">
        {item.description}
      </Text>

      {/* 이미지 */}
      <View
        className="w-40 h-40 rounded-full bg-blue-500 items-center justify-center"
        style={{ opacity: item.showImage ? 1 : 0 }}
      />
    </View>
  );
}

// 페이지 인디케이터
function PageIndicator({
  total,
  currentIndex,
}: {
  total: number;
  currentIndex: number;
}) {
  return (
    <View className="flex-row items-center justify-center gap-2 py-4">
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          className={`w-2 h-2 rounded-full ${
            index === currentIndex ? "bg-blue-500" : "bg-gray-300"
          }`}
        />
      ))}
    </View>
  );
}

// 소셜 로그인 버튼
function SocialLoginButton({
  provider,
  onPress,
}: {
  provider: "kakao" | "apple" | "google";
  onPress: () => void;
}) {
  const config = {
    kakao: {
      icon: "Ⓚ",
      text: "카카오 로그인",
      className: "bg-white border-gray-300",
      textClassName: "text-gray-700",
    },
    apple: {
      icon: "",
      text: "애플 로그인",
      className: "bg-white border-gray-300",
      textClassName: "text-black",
    },
    google: {
      icon: "G",
      text: "구글 로그인",
      className: "bg-white border-gray-300",
      textClassName: "text-gray-700",
    },
  };

  const { icon, text, className, textClassName } = config[provider];

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center justify-center h-14 rounded-xl border mx-6 ${className}`}
    >
      <Text className={`text-lg mr-2 ${textClassName}`}>{icon}</Text>
      <Text className={`text-base font-medium ${textClassName}`}>{text}</Text>
    </Pressable>
  );
}

export default function LoginScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 소셜 로그인 핸들러
  const handleKakaoLogin = () => {
    console.log("카카오 로그인");
    // TODO: 카카오 로그인 구현
  };

  const handleAppleLogin = () => {
    console.log("애플 로그인");
    // TODO: 애플 로그인 구현
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      {/* 헤더 */}
      <View className="items-center py-4">
        <Text className="text-base font-medium text-gray-900">로그인</Text>
      </View>

      {/* 카로셀 영역 */}
      <View style={{ flex: 1 }} className="bg-red-500">
        <Carousel
          width={SCREEN_WIDTH}
          data={ONBOARDING_DATA}
          onSnapToItem={(index: number) => setCurrentIndex(index)}
          renderItem={({ item }: { item: CarouselItem }) => (
            <CarouselItemView item={item} />
          )}
          loop={false}
        />
      </View>

      {/* 페이지 인디케이터 */}
      <PageIndicator
        total={ONBOARDING_DATA.length}
        currentIndex={currentIndex}
      />

      {/* 소셜 로그인 버튼들 */}
      <View className="gap-3 pb-8">
        <SocialLoginButton provider="kakao" onPress={handleKakaoLogin} />
        <SocialLoginButton provider="apple" onPress={handleAppleLogin} />
      </View>
    </SafeAreaView>
  );
}
