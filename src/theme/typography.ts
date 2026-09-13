import { StyleSheet } from "react-native";
export const fonts = {
  regular: "PlusJakartaSans-Regular",
  medium: "PlusJakartaSans-Medium",
  semibold: "PlusJakartaSans-SemiBold",
  bold: "PlusJakartaSans-Bold",
};
export const textStyles = StyleSheet.create({
  bold: {
    fontFamily: fonts.bold,
  },
  regular: {
    fontFamily: fonts.regular,
  },
  semibold: {
    fontFamily: fonts.semibold,
  },
  medium: {
    fontFamily: fonts.medium,
  },
});
