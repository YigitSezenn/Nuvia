
import { colors } from "@/theme/color";
import { textStyles } from "@/theme/typography";
import { Checkbox } from 'expo-checkbox';
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
function formToday(date = new Date ())
{
  const day = date.getDate(); // 1
  const month = date.toLocaleDateString("tr-TR", { month: "long" }); // Eylül
  const weekday = date.toLocaleDateString("tr-TR", { weekday: "long" }); // Pazartesi
  const cap  = (s:string) => s.charAt(0).toLocaleUpperCase() + s.slice(1); // Pazartesi, Eylül
  return `${day} ${cap(month)} ${cap(weekday)}`; // 1 Eylül Pazartesi
}

export default function Index() {
  const [todayLabel,setTodayLabel] = useState<string> (formToday());
  const [isChecked, setChecked] = useState(false);
  const [isFirstAdd,setIsFirstAdd] = useState(true);
 useEffect(() => {
   
    const timer = setInterval(() => {
      setTodayLabel(formToday());
    }, 60000); 

  
    return () => clearInterval(timer);
  }, [])
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[textStyles.bold, styles.date]}>{todayLabel}</Text>
        <Text style={[textStyles.bold, styles.title]}>Bugün</Text>
        <View style = {styles.statCard}>
        <Text style ={[textStyles.medium ,styles.statLabel]}>En Uzun Seri</Text>
        <View style = {styles.statRow}>
          <Text style={[textStyles.bold ,styles.statNumber]}>0</Text>
          <Text style={[textStyles.semibold ,styles.statUnit]}>gün üst üste</Text>
          <Text style={[textStyles.regular ,styles.statSub]}>0/ 0 alışkanlık tamam</Text>
        </View>
        </View>
        <View style={styles.sectionHeader}>
        <Text style={[textStyles.semibold, styles.sectionTitle]}>Alışkanlıklar</Text>
        <Pressable onPress={() => setIsFirstAdd(false)}>
        <Text style={[textStyles.semibold, styles.AddHabitButtonText]}>+ Ekle</Text>
        </Pressable>
        </View>
         {isFirstAdd ?(
          <Pressable onPress={() => setIsFirstAdd(false)}>
            <Text style={[textStyles.regular, styles.firstAddText]}>
              İlk alışkanlığını eklemek için tıklayın
            </Text>
          </Pressable>
         ):(

        <View style = {styles.habitRow}>
          <View style={styles.habitAvatar}>
            <Text style={[textStyles.semibold, styles.habitAvatarText]}>A</Text>
          </View>
          
          <View style={styles.habitText}>
            <Text style={[textStyles.semibold, styles.habitName]}>Alışkanlık 1</Text>
            <Text style={[textStyles.regular, styles.habitStreak]}>0 gün üst üste</Text>
        
          </View>
          <View style={styles.checkButton}>
          <Checkbox
          style={styles.checkButton}
          value={isChecked}
          onValueChange={setChecked}
          color={isChecked ? colors.accent : colors.ink}
        />
        </View> 
        </View>
        )}
                
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
  paddingHorizontal: 20,
  paddingTop: 12,
  },
  date: {
    fontSize: 14,
    color: colors.inkMuted,
  },
  title: {
    fontSize: 24,
    color: colors.ink,
    marginTop: 4,
  },
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
   /* marginHorizontal: 20,*/
    marginTop: 20,
  },
  statLabel: {
    fontSize: 14,
    color: colors.inkMuted,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 8,
  },
  statNumber: {
    fontSize: 40,
    color: colors.accent,
  },
  statUnit: {
    fontSize: 22,
    color: colors.cardText,
  },
  statSub: {
    fontSize: 14,
    color: colors.inkMuted,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: colors.accent,
  },
 
  AddHabitButtonText: {
    fontSize: 16,
    color: colors.accent,
  },
  habitSection: {
    marginTop: 24,
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    gap: 12,
  },
  habitAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },

  habitText: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  habitName: { fontSize: 16, color: colors.ink },
  habitAvatarText: { fontSize: 20, color: colors.white },

  habitStreak: { fontSize: 13, color: colors.inkMuted, marginTop: 2 },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  firstAddText: {
    fontSize: 16,
    color: colors.accent,
    marginTop: 24,
    textAlign: "center",
  },
})