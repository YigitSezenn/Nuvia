import { textStyles } from "@/theme/typography";
import { StyleSheet, Text, View } from "react-native";
export default function Calendar() {
  return (
    <View style={styles.container}>
      <Text style={textStyles.semibold} >Takvim</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  


});
