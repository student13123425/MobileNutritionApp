import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Slide {
  title: string;
  content: string;
  icon: string;
}

interface IntroductionPageProps {
  navigation: any;
  lightColors?: any;
  darkColors?: any;
}

const SCREEN_WIDTH = Dimensions.get("window").width;

const SLIDES: Slide[] = [
  {
    title: "AI Food Scanner",
    content: "Snap a photo and instantly identify your meal. Get nutrition facts in seconds.",
    icon: "camera-alt",
  },
  {
    title: "Calorie Tracker",
    content: "Log meals, track daily calorie intake, and set goals for better eating habits.",
    icon: "local-fire-department",
  },
  {
    title: "Daily Insights",
    content: "Get smart recommendations based on your habits. Improve your health with data-driven choices.",
    icon: "schedule",
  },
];

const IntroductionPage: React.FC<IntroductionPageProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const nextSlide = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleGoToHome = async () => {
    try {
      await AsyncStorage.setItem("has_started", "true");
      navigation.replace("HomeScreen");
    } catch (e) {
      console.error("Failed to set started flag", e);
    }
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Welcome to GreenPlate</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.slideWrapper}>
          <Icon name={SLIDES[currentIndex].icon} size={60} color="#2e7d32" />
          <View style={{ height: 24 }} />
          <Text style={styles.titleText}>{SLIDES[currentIndex].title}</Text>
          <View style={{ height: 16 }} />
          <Text style={styles.contentText}>{SLIDES[currentIndex].content}</Text>
        </View>
      </View>

      <View style={styles.footerPadding}>
        <View style={styles.buttonRow}>
          <View style={{ flex: 1, alignItems: "flex-start" }}>
            {currentIndex > 0 ? (
              <TouchableOpacity style={styles.prevButton} onPress={prevSlide}>
                <Text style={styles.prevButtonText}>Previous</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 0, height: 48 }} />
            )}
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={isLastSlide ? handleGoToHome : nextSlide}
          >
            <Text style={styles.nextButtonText}>
              {isLastSlide ? "GO" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  appBar: {
    height: 60,
    backgroundColor: "#4caf50",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  appBarTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 32,
    justifyContent: "center",
  },
  slideWrapper: {
    alignItems: "center",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1b5e20",
    textAlign: "center",
  },
  contentText: {
    fontSize: 16,
    color: "#2e7d32",
    textAlign: "center",
    lineHeight: 24,
  },
  footerPadding: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  prevButton: {
    backgroundColor: "#c8e6c9",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  prevButtonText: {
    color: "#2e7d32",
    fontWeight: "bold",
  },
  nextButton: {
    backgroundColor: "#4caf50",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default IntroductionPage;
