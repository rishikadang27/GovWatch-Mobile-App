import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/src/theme/colors';
import { radii, spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

export type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export function Icon({ name, size = 20, color = colors.ink, ...props }: { name: IconName; size?: number; color?: string; onPress?: () => void }) {
  return <MaterialCommunityIcons name={name} size={size} color={color} {...props} />;
}

export function AppHeader({ title, subtitle, onBack, right, dark = false }: { title: string; subtitle?: string; onBack?: () => void; right?: React.ReactNode; dark?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, dark && styles.headerDark, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.headerRow}>
        {onBack ? <Pressable testID="header-back" onPress={onBack} style={[styles.backButton, dark && styles.backButtonDark]}><Icon name="arrow-left" color={dark ? colors.white : colors.ink} size={22} /></Pressable> : <View style={styles.headerBrand}><Text style={[styles.brand, dark && styles.darkText]}>GovWatch</Text><Text style={[styles.brandSub, dark && styles.darkMuted]}>Ministry of Social Justice & Empowerment</Text></View>}
        <View style={styles.headerCopy}>{onBack && <><Text style={[styles.headerTitle, dark && styles.darkText]}>{title}</Text>{subtitle && <Text style={[styles.headerSubtitle, dark && styles.darkMuted]}>{subtitle}</Text>}</>}</View>
        {right}
      </View>
    </View>
  );
}

export function BottomNav({ active, onNavigate }: { active: 'home' | 'inspect' | 'cctv' | 'institutes'; onNavigate: (tab: 'home' | 'inspect' | 'cctv' | 'institutes') => void }) {
  const insets = useSafeAreaInsets();
  const items: { id: 'home' | 'inspect' | 'cctv' | 'institutes'; label: string; icon: IconName }[] = [
    { id: 'home', label: 'Home', icon: 'home-variant-outline' },
    { id: 'inspect', label: 'Inspect', icon: 'clipboard-check-outline' },
    { id: 'cctv', label: 'CCTV', icon: 'cctv' },
    { id: 'institutes', label: 'Institutes', icon: 'bank-outline' },
  ];
  return <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>{items.map((item) => {
    const selected = active === item.id;
    return <Pressable key={item.id} testID={`nav-${item.id}`} onPress={() => onNavigate(item.id)} style={styles.navItem}>
      <Icon name={item.icon} color={selected ? colors.teal : colors.inkMuted} size={22} />
      <Text style={[styles.navLabel, selected && styles.navLabelActive]}>{item.label}</Text>
      {selected && <View style={styles.navIndicator} />}
    </Pressable>;
  })}</View>;
}

export function SearchBar({ value, onChangeText, placeholder, onFilter }: { value: string; onChangeText: (value: string) => void; placeholder: string; onFilter?: () => void }) {
  return <View style={styles.searchBar}><Icon name="magnify" size={22} color={colors.teal} /><TextInput testID="search-input" value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.inkMuted} style={styles.searchInput} /><Pressable onPress={onFilter} hitSlop={8}><Icon name="tune-variant" size={21} color={colors.teal} /></Pressable></View>;
}

export function Chip({ label, selected, onPress, tone = 'teal' }: { label: string; selected?: boolean; onPress?: () => void; tone?: 'teal' | 'red' | 'amber' }) {
  return <Pressable onPress={onPress} style={[styles.chip, selected && (tone === 'red' ? styles.chipRed : tone === 'amber' ? styles.chipAmber : styles.chipSelected)]}><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text></Pressable>;
}

export function Surface({ children, style, dark = false }: { children: React.ReactNode; style?: object; dark?: boolean }) {
  const normalizedChildren = React.Children.map(children, (child, index) =>
    typeof child === 'string' ? <Text key={`surface-text-${index}`} style={styles.bodyText}>{child}</Text> : child,
  );
  return <View style={[styles.surface, dark && styles.surfaceDark, style]}>{normalizedChildren}</View>;
}

export function PrimaryButton({ label, onPress, icon, loading, disabled, style }: { label: string; onPress: () => void; icon?: IconName; loading?: boolean; disabled?: boolean; style?: object }) {
  return <Pressable testID={`button-${label}`} onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [styles.primaryButton, (disabled || loading) && styles.buttonDisabled, pressed && styles.pressed, style]}>{loading ? <ActivityIndicator color={colors.white} /> : <>{icon && <Icon name={icon} color={colors.white} size={19} />}<Text style={styles.primaryButtonText}>{label}</Text></>}</Pressable>;
}

export function SecondaryButton({ label, onPress, icon, style }: { label: string; onPress: () => void; icon?: IconName; style?: object }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed, style]}>{icon && <Icon name={icon} color={colors.ink} size={18} />}<Text style={styles.secondaryButtonText}>{label}</Text></Pressable>;
}

export function StatusBadge({ label, tone = 'success' }: { label: string; tone?: 'success' | 'warning' | 'critical' | 'info' | 'neutral' }) {
  const backgroundStyle = tone === 'warning' ? styles.badgeAmber : tone === 'critical' ? styles.badgeRed : tone === 'info' ? styles.badgeBlue : tone === 'neutral' ? styles.badgeNeutral : styles.badgeGreen;
  const textStyle = tone === 'warning' ? styles.textAmber : tone === 'critical' ? styles.textRed : tone === 'info' ? styles.textBlue : tone === 'neutral' ? styles.textNeutral : styles.textGreen;
  return <View style={[styles.statusBadge, backgroundStyle]}><View style={[styles.badgeDot, { backgroundColor: tone === 'warning' ? colors.amber : tone === 'critical' ? colors.red : tone === 'info' ? colors.blue : tone === 'neutral' ? colors.inkMuted : colors.success }]} /><Text style={[styles.statusText, textStyle]}>{label}</Text></View>;
}

export function StatStrip({ items }: { items: { label: string; value: string; icon: IconName; tone?: 'green' | 'amber' | 'red' }[] }) {
  return <Surface style={styles.statStrip}>{items.map((item, index) => <React.Fragment key={item.label}><View style={styles.statItem}><View style={[styles.statIcon, item.tone === 'amber' && styles.statIconAmber, item.tone === 'red' && styles.statIconRed]}><Icon name={item.icon} color={item.tone === 'red' ? colors.red : item.tone === 'amber' ? colors.amber : colors.teal} size={18} /></View><Text style={styles.statValue}>{item.value}</Text><Text style={styles.statLabel}>{item.label}</Text></View>{index < items.length - 1 && <View style={styles.statDivider} />}</React.Fragment>)}</Surface>;
}

export function SimpleModal({ visible, onClose, title, children }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}><KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={styles.modalCard}><View style={styles.modalHeader}><Text style={styles.modalTitle}>{title}</Text><Pressable onPress={onClose} hitSlop={10}><Icon name="close" color={colors.ink} size={22} /></Pressable></View><ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>{children}</ScrollView></View></KeyboardAvoidingView></Modal>;
}

export function Field({ label, value, onChangeText, placeholder, secureTextEntry, right, multiline }: { label?: string; value: string; onChangeText: (value: string) => void; placeholder?: string; secureTextEntry?: boolean; right?: React.ReactNode; multiline?: boolean }) {
  return <View style={styles.fieldWrap}>{label && <Text style={styles.fieldLabel}>{label}</Text>}<View style={styles.field}><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.inkMuted} secureTextEntry={secureTextEntry} style={[styles.fieldInput, multiline && styles.fieldMultiline]} multiline={multiline} /><View>{right}</View></View></View>;
}

export function ImageThumb({ source, style }: { source: ImageSourcePropType; style?: object }) {
  return <Image source={source} style={[styles.imageThumb, style]} resizeMode="cover" />;
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.ivory, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  headerDark: { backgroundColor: colors.tealDeep },
  headerRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerBrand: { flex: 1 },
  brand: { color: colors.ink, fontSize: 22, fontWeight: typography.weightBold, letterSpacing: -0.6 },
  brandSub: { color: colors.inkMuted, fontSize: 10, marginTop: 2 },
  headerCopy: { flex: 1 },
  headerTitle: { color: colors.ink, fontSize: typography.title, fontWeight: typography.weightBold },
  headerSubtitle: { color: colors.inkMuted, fontSize: 11, marginTop: 2 },
  darkText: { color: colors.white },
  darkMuted: { color: '#C6E3DC' },
  backButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tealSoft },
  backButtonDark: { backgroundColor: '#FFFFFF1C' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: colors.paper, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: spacing.sm, elevation: 10 },
  navItem: { flex: 1, alignItems: 'center', gap: 3, minHeight: 48 },
  navLabel: { fontSize: 11, color: colors.inkMuted, fontWeight: typography.weightMedium },
  navLabelActive: { color: colors.teal, fontWeight: typography.weightBold },
  navIndicator: { height: 3, width: 46, borderRadius: 3, backgroundColor: colors.teal, marginTop: 2 },
  searchBar: { height: 48, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, borderRadius: radii.pill, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.sm, shadowColor: colors.shadow, shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  searchInput: { flex: 1, color: colors.ink, fontSize: typography.body },
  chip: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, borderRadius: radii.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  chipSelected: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipRed: { backgroundColor: colors.red, borderColor: colors.red },
  chipAmber: { backgroundColor: colors.amber, borderColor: colors.amber },
  chipText: { color: colors.inkMuted, fontSize: 12, fontWeight: typography.weightMedium },
  chipTextSelected: { color: colors.white },
  surface: { backgroundColor: colors.paper, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.line, shadowColor: colors.shadow, shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  surfaceDark: { backgroundColor: colors.tealDeep, borderColor: '#FFFFFF1A' },
  primaryButton: { minHeight: 48, borderRadius: radii.pill, backgroundColor: colors.teal, paddingHorizontal: spacing.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  primaryButtonText: { color: colors.white, fontSize: typography.body, fontWeight: typography.weightBold },
  buttonDisabled: { opacity: 0.55 },
  secondaryButton: { minHeight: 46, borderRadius: radii.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  secondaryButtonText: { color: colors.ink, fontSize: typography.body, fontWeight: typography.weightSemibold },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  statusBadge: { borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start' },
  badgeGreen: { backgroundColor: colors.successSoft }, badgeAmber: { backgroundColor: colors.amberSoft }, badgeRed: { backgroundColor: colors.redSoft }, badgeBlue: { backgroundColor: colors.blueSoft }, badgeNeutral: { backgroundColor: colors.paperDeep },
  badgeDot: { width: 6, height: 6, borderRadius: 3 }, statusText: { fontSize: 10, fontWeight: typography.weightBold }, textGreen: { color: colors.success }, textAmber: { color: colors.amber }, textRed: { color: colors.red }, textBlue: { color: colors.blue }, textNeutral: { color: colors.inkMuted },
  statStrip: { flexDirection: 'row', paddingVertical: spacing.md, paddingHorizontal: spacing.sm },
  statItem: { flex: 1, alignItems: 'center', gap: 3 }, statIcon: { width: 34, height: 34, backgroundColor: colors.tealWash, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }, statIconAmber: { backgroundColor: colors.amberSoft }, statIconRed: { backgroundColor: colors.redSoft }, statValue: { color: colors.ink, fontSize: 18, fontWeight: typography.weightBold }, statLabel: { color: colors.inkMuted, fontSize: 10, textAlign: 'center' }, statDivider: { width: 1, backgroundColor: colors.line, marginVertical: 5 },
  modalBackdrop: { flex: 1, backgroundColor: '#073B3A88', justifyContent: 'flex-end' }, modalCard: { backgroundColor: colors.ivory, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, padding: spacing.xl, paddingBottom: 32, maxHeight: '82%' }, modalContent: { paddingBottom: spacing.sm }, modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }, modalTitle: { color: colors.ink, fontSize: 18, fontWeight: typography.weightBold }, bodyText: { color: colors.inkMuted, fontSize: 13, lineHeight: 20 },
  fieldWrap: { gap: spacing.sm }, fieldLabel: { color: colors.ink, fontSize: 12, fontWeight: typography.weightSemibold }, field: { minHeight: 50, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, borderRadius: radii.md, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center' }, fieldInput: { flex: 1, color: colors.ink, fontSize: typography.body }, fieldMultiline: { minHeight: 96, textAlignVertical: 'top', paddingTop: spacing.md }, imageThumb: { width: '100%', height: 160, borderRadius: radii.md },
});