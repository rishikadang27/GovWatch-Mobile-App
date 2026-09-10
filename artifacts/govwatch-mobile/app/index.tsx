import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppHeader,
  BottomNav,
  Chip,
  Field,
  Icon,
  ImageThumb,
  PrimaryButton,
  SearchBar,
  SecondaryButton,
  SimpleModal,
  StatStrip,
  StatusBadge,
  Surface,
} from '@/src/components/GovWatchUI';

import {
  alerts,
  checklistItems,
  feeds,
  inspectorImage,
  officers,
  type Alert as AlertItem,
  type Feed,
  type Risk,
} from '@/src/data/mock';

import { GovWatchProvider, useGovWatch } from '@/src/context/GovWatchContext';
import { colors } from '@/src/theme/colors';
import { radii, spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

type Screen =
  | 'login'
  | 'home'
  | 'alerts'
  | 'alertDetail'
  | 'cctv'
  | 'cctvDetail'
  | 'video'
  | 'call'
  | 'gps'
  | 'checklist'
  | 'evidence'
  | 'report'
  | 'assignment'
  | 'institutes'
  | 'notifications';

type NavTab = 'home' | 'inspect' | 'cctv' | 'institutes';

const REGISTERED_LATITUDE = 28.6139;
const REGISTERED_LONGITUDE = 77.2090;

function GovWatchApp() {
  const insets = useSafeAreaInsets();

  const {
    isSignedIn,
    setSignedIn,
    keepSignedIn,
    setKeepSignedIn,
    checklist,
    toggleChecklist,
    evidence,
    addEvidence,
    assignedInstitutes,
    assignInstitute,
    submitted,
    setSubmitted,
  } = useGovWatch();

  const [screen, setScreen] = useState<Screen>(isSignedIn ? 'home' : 'login');
  const [previousScreen, setPreviousScreen] = useState<Screen>('home');

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [forgotOpen, setForgotOpen] = useState(false);
  const [recoveryId, setRecoveryId] = useState('');

  const [selectedRole, setSelectedRole] = useState<
    'District Officer' | 'Field Inspector' | 'Ministry Admin'
  >('Field Inspector');

  const [search, setSearch] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [selectedFeed, setSelectedFeed] = useState<Feed | null>(null);
  const [toast, setToast] = useState('');

  const [callState, setCallState] = useState<
    'idle' | 'connecting' | 'connected' | 'ended'
  >('idle');

  const [gpsState, setGpsState] = useState<'checking' | 'verified'>('checking');

  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObjectCoords | null>(null);

  const [assessment, setAssessment] = useState<
    'Satisfactory' | 'Needs improvement' | 'Critical issues found'
  >('Satisfactory');

  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (screen === 'gps') {
      setGpsState('checking');
      setCurrentLocation(null);

      let mounted = true;

      const verify = async () => {
        try {
          if (Platform.OS !== 'web') {
            const permission =
              await Location.requestForegroundPermissionsAsync();

            if (permission.status === 'granted') {
              const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
              });

              if (mounted) {
                setCurrentLocation(location.coords);
              }
            }
          }
        } catch {
          /* demo fallback remains available */
        }

        setTimeout(() => {
          if (mounted) {
            setGpsState('verified');
          }
        }, 900);
      };

      void verify();

      return () => {
        mounted = false;
      };
    }

    return undefined;
  }, [screen]);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = setTimeout(() => setToast(''), 2500);

    return () => clearTimeout(timer);
  }, [toast]);

  const navigate = (next: Screen) => {
    setPreviousScreen(screen);
    setScreen(next);
    setSearch('');
  };

  const activeTab: NavTab =
    screen === 'cctv' || screen === 'cctvDetail'
      ? 'cctv'
      : screen === 'institutes' || screen === 'assignment'
        ? 'institutes'
        : screen === 'gps' ||
            screen === 'checklist' ||
            screen === 'evidence' ||
            screen === 'report' ||
            screen === 'video' ||
            screen === 'call'
          ? 'inspect'
          : 'home';

  const bottomTabs = [
    'home',
    'cctv',
    'institutes',
    'assignment',
    'gps',
    'checklist',
    'evidence',
    'report',
    'video',
    'call',
  ].includes(screen);

  const goBack = () =>
    setScreen(previousScreen === screen ? 'home' : previousScreen);

  const handleLogin = () => {
    if (selectedRole !== 'Field Inspector') {
      setLoginError(
        `${selectedRole} sign-in is not yet enabled in this demo build. Please continue as Field Inspector.`,
      );
      return;
    }

    if (
      loginId.trim().toUpperCase() === 'MSJE-DI-20456' &&
      password === 'demo123'
    ) {
      setLoginError('');
      setSignedIn(true);
      setScreen('home');
    } else {
      setLoginError(
        'That official ID or password is not recognised. Try the demo credentials shown below.',
      );
    }
  };

  const handleNav = (tab: NavTab) => {
    if (tab === 'home') setScreen('home');
    if (tab === 'inspect') setScreen('gps');
    if (tab === 'cctv') setScreen('cctv');
    if (tab === 'institutes') setScreen('institutes');
  };

  const showToast = (message: string) => setToast(message);

  if (screen === 'login') {
    return (
      <LoginScreen
        loginId={loginId}
        setLoginId={setLoginId}
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        keepSignedIn={keepSignedIn}
        setKeepSignedIn={setKeepSignedIn}
        loginError={loginError}
        onLogin={handleLogin}
        forgotOpen={forgotOpen}
        setForgotOpen={setForgotOpen}
        recoveryId={recoveryId}
        setRecoveryId={setRecoveryId}
        onRequestRecovery={() => {
          setForgotOpen(false);
          setRecoveryId('');
          showToast(
            'Recovery request sent to your registered department email',
          );
        }}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
      />
    );
  }

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return (
          <HomeScreen
            search={search}
            setSearch={setSearch}
            onNavigate={navigate}
            onNotify={() => setNotificationsOpen(true)}
            onProfile={() => setProfileOpen(true)}
          />
        );

      case 'alerts':
        return (
          <AlertsScreen
            search={search}
            setSearch={setSearch}
            onBack={goBack}
            onOpen={(item) => {
              setSelectedAlert(item);
              navigate('alertDetail');
            }}
            onToast={showToast}
          />
        );

      case 'alertDetail':
        return (
          <AlertDetailScreen
            item={selectedAlert ?? alerts[0]}
            onBack={goBack}
            onVerify={() => {
              setCallState('connecting');
              navigate('call');
            }}
            onEscalate={() => navigate('gps')}
          />
        );

      case 'cctv':
        return (
          <CCTVScreen
            search={search}
            setSearch={setSearch}
            onBack={goBack}
            onOpen={(item) => {
              setSelectedFeed(item);
              navigate('cctvDetail');
            }}
            onToast={showToast}
          />
        );

      case 'cctvDetail':
        return (
          <CCTVDetailScreen
            feed={selectedFeed ?? feeds[0]}
            onBack={goBack}
          />
        );

      case 'video':
        return (
          <VideoVerificationScreen
            onBack={goBack}
            onCall={() => {
              setCallState('connecting');
              navigate('call');
            }}
            onToast={showToast}
          />
        );

      case 'call':
        return (
          <CallScreen
            state={callState}
            setState={setCallState}
            onBack={() => setScreen('video')}
          />
        );

      case 'gps':
        return (
          <GpsScreen
            gpsState={gpsState}
            currentLocation={currentLocation}
            onBack={goBack}
            onNext={() => navigate('checklist')}
            onMap={() => showToast('Map is centered on your GPS location')}
          />
        );

      case 'checklist':
        return (
          <ChecklistScreen
            checklist={checklist}
            toggle={toggleChecklist}
            onBack={goBack}
            onNext={() => navigate('evidence')}
            onToast={showToast}
          />
        );

      case 'evidence':
        return (
          <EvidenceScreen
            evidence={evidence}
            onBack={goBack}
            onAdd={async (kind) => {
              if (kind === 'photo') {
                try {
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    quality: 0.8,
                  });

                  if (!result.canceled && result.assets[0]) {
                    const evidenceCoords = currentLocation
                      ? `${currentLocation.latitude.toFixed(4)}° N, ${currentLocation.longitude.toFixed(4)}° E`
                      : '28.6141° N, 77.2088° E';

                    addEvidence({
                      id: `upload-${Date.now()}`,
                      title: 'New photo evidence',
                      image: { uri: result.assets[0].uri },
                      time: 'Now',
                      coords: evidenceCoords,
                    });
                  } else {
                    showToast(
                      'Demo gallery kept the existing evidence ready',
                    );
                  }
                } catch {
                  showToast(
                    'Demo evidence added — device picker unavailable',
                  );
                }
              } else {
                showToast('Video capture ready in the native build');
              }
            }}
            onNext={() => navigate('report')}
          />
        );

      case 'report':
        return (
          <ReportScreen
            checklist={checklist}
            evidenceCount={evidence.length}
            assessment={assessment}
            setAssessment={setAssessment}
            remarks={remarks}
            setRemarks={setRemarks}
            submitted={submitted}
            submitting={submitting}
            onBack={goBack}
            onSubmit={async () => {
              setSubmitting(true);
              await new Promise((resolve) => setTimeout(resolve, 1000));
              setSubmitting(false);
              setSubmitted(true);
            }}
            onDone={() => {
              setSubmitted(false);
              setScreen('home');
            }}
          />
        );

      case 'assignment':
        return (
          <AssignmentScreen
            institutes={assignedInstitutes}
            search={search}
            setSearch={setSearch}
            onBack={goBack}
            onAssign={(id, officer) => {
              assignInstitute(id, officer);
              showToast(`Inspection assigned to ${officer}`);
            }}
            onViewAll={() => navigate('institutes')}
          />
        );

      case 'institutes':
        return (
          <InstitutesScreen
            institutes={assignedInstitutes}
            search={search}
            setSearch={setSearch}
            onBack={goBack}
            onInspect={() => navigate('gps')}
          />
        );

      case 'notifications':
        return <NotificationsScreen onBack={goBack} />;

      default:
        return null;
    }
  };

  return (
    <View style={styles.appShell}>
      <View style={{ flex: 1 }}>{renderScreen()}</View>

      {bottomTabs && (
        <BottomNav active={activeTab} onNavigate={handleNav} />
      )}

      {Boolean(toast) && (
        <View
          style={[
            styles.toast,
            {
              bottom: bottomTabs ? 100 : 30 + insets.bottom,
            },
          ]}
        >
          <Icon
            name="check-circle-outline"
            color={colors.white}
            size={18}
          />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      <SimpleModal
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        title="Notifications"
      >
        <View style={styles.notificationRow}>
          <View style={styles.notificationIcon}>
            <Icon
              name="alert-circle-outline"
              color={colors.red}
              size={20}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.notificationTitle}>
              2 critical AI alerts need review
            </Text>
            <Text style={styles.notificationMeta}>
              Updated 8 minutes ago
            </Text>
          </View>
        </View>

        <PrimaryButton
          label="Open AI Alerts"
          icon="arrow-right"
          onPress={() => {
            setNotificationsOpen(false);
            navigate('alerts');
          }}
        />
      </SimpleModal>

      <SimpleModal
        visible={profileOpen}
        onClose={() => setProfileOpen(false)}
        title="Field Inspector Account"
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatarLarge}>
            <Image
              source={inspectorImage}
              style={styles.profileAvatarImage}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>Field Inspector</Text>
            <Text style={styles.profileMeta}>
              MSJE-DI-20456 · New Delhi District
            </Text>
          </View>
        </View>

        <View style={styles.profileDivider} />

        <Text style={styles.profileSectionTitle}>Session</Text>

        <Text style={styles.profileBody}>
          You are signed in as a Field Inspector. Sign out here to return
          to the secure login screen.
        </Text>

        <SecondaryButton
          label="Sign out"
          icon="logout"
          onPress={() => {
            setProfileOpen(false);
            setSignedIn(false);
            setLoginError('');
            setScreen('login');
          }}
          style={styles.signOutButton}
        />
      </SimpleModal>
    </View>
  );
}

function LoginScreen({
  loginId,
  setLoginId,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  keepSignedIn,
  setKeepSignedIn,
  loginError,
  onLogin,
  forgotOpen,
  setForgotOpen,
  recoveryId,
  setRecoveryId,
  onRequestRecovery,
  selectedRole,
  setSelectedRole,
}: {
  loginId: string;
  setLoginId: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  keepSignedIn: boolean;
  setKeepSignedIn: (value: boolean) => void;
  loginError: string;
  onLogin: () => void;
  forgotOpen: boolean;
  setForgotOpen: (value: boolean) => void;
  recoveryId: string;
  setRecoveryId: (value: string) => void;
  onRequestRecovery: () => void;
  selectedRole:
    | 'District Officer'
    | 'Field Inspector'
    | 'Ministry Admin';
  setSelectedRole: (
    value: 'District Officer' | 'Field Inspector' | 'Ministry Admin',
  ) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.loginShell}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xl,
          paddingBottom: spacing.section,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.loginBrand}>
          <View style={styles.logoMark}>
            <Icon
              name="shield-check-outline"
              color={colors.white}
              size={30}
            />
          </View>

          <View>
            <Text style={styles.loginBrandTitle}>GovWatch</Text>
            <Text style={styles.loginBrandSub}>
              Ministry of Social Justice & Empowerment
            </Text>
          </View>
        </View>

        <Text style={styles.loginHero}>
          Transparent oversight{'\n'}
          for every institution{'\n'}
          in our care.
        </Text>

        <Text style={styles.loginIntro}>
          A secure workspace for the officers who keep care accountable.
        </Text>

        <View style={styles.loginStats}>
          {[
            ['4,812', 'Institutes monitored'],
            ['28', 'States & UTs covered'],
            ['99.4%', 'Uptime this quarter'],
          ].map(([value, label]) => (
            <View key={label} style={styles.loginStat}>
              <Text style={styles.loginStatValue}>{value}</Text>
              <Text style={styles.loginStatLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <Surface style={styles.loginCard}>
          <Text style={styles.loginTitle}>Official sign-in</Text>

          <Text style={styles.loginSubtitle}>
            Use your authorised Ministry credentials to continue.
          </Text>

          <Text style={styles.roleLabel}>Sign in as</Text>

          <View style={styles.roleRow}>
            {(
              [
                'District Officer',
                'Field Inspector',
                'Ministry Admin',
              ] as const
            ).map((role) => {
              const active = selectedRole === role;

              return (
                <Pressable
                  key={role}
                  onPress={() => setSelectedRole(role)}
                  style={[
                    styles.roleButton,
                    active && styles.roleButtonActive,
                  ]}
                >
                  <Icon
                    name={
                      role === 'District Officer'
                        ? 'map-marker-radius-outline'
                        : role === 'Field Inspector'
                          ? 'clipboard-account-outline'
                          : 'shield-account-outline'
                    }
                    size={18}
                    color={active ? colors.white : colors.teal}
                  />

                  <Text
                    style={[
                      styles.roleText,
                      active && styles.roleTextActive,
                    ]}
                  >
                    {role}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Field
            label="Official ID / Employee code"
            value={loginId}
            onChangeText={setLoginId}
            placeholder="e.g. MSJE-DI-20456"
          />

          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry={!showPassword}
            right={
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon
                  name={
                    showPassword
                      ? 'eye-off-outline'
                      : 'eye-outline'
                  }
                  color={colors.inkMuted}
                  size={20}
                />
              </Pressable>
            }
          />

          {Boolean(loginError) && (
            <View style={styles.errorBox}>
              <Icon
                name="alert-circle-outline"
                color={colors.red}
                size={18}
              />
              <Text style={styles.errorText}>{loginError}</Text>
            </View>
          )}

          <View style={styles.loginOptions}>
            <Pressable
              onPress={() => setKeepSignedIn(!keepSignedIn)}
              style={styles.checkLine}
            >
              <View
                style={[
                  styles.checkbox,
                  keepSignedIn && styles.checkboxChecked,
                ]}
              >
                {keepSignedIn && (
                  <Icon
                    name="check"
                    color={colors.white}
                    size={14}
                  />
                )}
              </View>

              <Text
                style={styles.checkLabel}
                numberOfLines={1}
              >
                Keep me signed in
              </Text>
            </Pressable>

            <Pressable
              hitSlop={10}
              onPress={() => setForgotOpen(true)}
              style={styles.forgotButton}
            >
              <Text
                style={styles.linkText}
                numberOfLines={1}
              >
                Forgot password?
              </Text>
            </Pressable>
          </View>

          <PrimaryButton
            label="Sign in securely"
            icon="arrow-right"
            onPress={onLogin}
          />

          <View style={styles.auditNote}>
            <Icon
              name="shield-lock-outline"
              color={colors.teal}
              size={18}
            />
            <Text style={styles.auditText}>
              Protected by Ministry security controls. Your activity is
              logged for audit.
            </Text>
          </View>
        </Surface>

        <Text style={styles.demoHint}>
          Demo access · MSJE-DI-20456 · demo123
        </Text>
      </ScrollView>

      <SimpleModal
        visible={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Recover official access"
      >
        <Text style={styles.modalBody}>
          Enter your official ID and the access recovery team will contact
          your registered department email.
        </Text>

        <Field
          label="Official ID"
          value={recoveryId}
          onChangeText={setRecoveryId}
          placeholder="MSJE-DI-20456"
        />

        <PrimaryButton
          label="Request recovery"
          onPress={onRequestRecovery}
          disabled={!recoveryId.trim()}
          style={{ marginTop: spacing.lg }}
        />
      </SimpleModal>
    </KeyboardAvoidingView>
  );
}

function HomeScreen({
  search,
  setSearch,
  onNavigate,
  onNotify,
  onProfile,
}: {
  search: string;
  setSearch: (value: string) => void;
  onNavigate: (screen: Screen) => void;
  onNotify: () => void;
  onProfile: () => void;
}) {
  const [filter, setFilter] = useState('All');

  const filteredAlerts = alerts
    .filter(
      (item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.institute.toLowerCase().includes(search.toLowerCase()),
    )
    .filter(
      (item) =>
        filter === 'All' ||
        (filter === 'Compliance' ? item.severity !== 'Medium' : true) ||
        (filter === 'Video Verification' &&
          item.title.includes('headcount')) ||
        (filter === 'Live CCTV' && item.title.includes('CCTV')),
    );

  return (
    <View style={styles.screen}>
      <AppHeader
        title=""
        right={
          <View style={styles.headerActions}>
            <Pressable
              onPress={onNotify}
              style={styles.headerIcon}
            >
              <Icon
                name="bell-outline"
                color={colors.ink}
                size={21}
              />
              <View style={styles.alertDot} />
            </Pressable>

            <Pressable
              onPress={onProfile}
              style={styles.avatar}
              accessibilityLabel="Open Field Inspector account"
            >
              <Image
                source={inspectorImage}
                style={styles.avatarImage}
              />
            </Pressable>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>Namaste, Inspector</Text>
            <Text style={styles.greetingMeta}>
              Field Inspector · New Delhi District
            </Text>
          </View>

          <Text style={styles.dateText}>
            Mon, 7 Sep{'\n'}09:41 IST
          </Text>
        </View>

        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search Scheme ID or NGO name..."
          onFilter={() => onNavigate('assignment')}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {[
            'All',
            'Compliance',
            'Video Verification',
            'Live CCTV',
            'Assign Inspection',
          ].map((item) => (
            <Chip
              key={item}
              label={item}
              selected={filter === item}
              onPress={() =>
                item === 'Assign Inspection'
                  ? onNavigate('assignment')
                  : item === 'Video Verification'
                    ? onNavigate('video')
                    : item === 'Live CCTV'
                      ? onNavigate('cctv')
                      : setFilter(item)
              }
            />
          ))}
        </ScrollView>

        <StatStrip
          items={[
            {
              label: 'Pending inspections',
              value: '4',
              icon: 'clipboard-alert-outline',
              tone: 'amber',
            },
            {
              label: 'Completed today',
              value: '12',
              icon: 'check-circle-outline',
              tone: 'green',
            },
            {
              label: 'This week',
              value: '8',
              icon: 'calendar-check-outline',
              tone: 'green',
            },
            {
              label: 'Overdue',
              value: '2',
              icon: 'clock-alert-outline',
              tone: 'red',
            },
          ]}
        />

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>
              AI anomaly alerts
            </Text>
            <Text style={styles.sectionSubtitle}>
              Priority items that need your attention
            </Text>
          </View>

          <Pressable onPress={() => onNavigate('alerts')}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        {filteredAlerts.slice(0, 3).map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onNavigate('alertDetail')}
            style={styles.alertPreview}
          >
            <ImageThumb
              source={item.image}
              style={styles.alertPreviewImage}
            />

            <View style={styles.alertPreviewBody}>
              <StatusBadge
                label={item.severity}
                tone={
                  item.severity === 'Critical'
                    ? 'critical'
                    : item.severity === 'High'
                      ? 'warning'
                      : 'info'
                }
              />

              <Text style={styles.alertPreviewTitle}>
                {item.title}
              </Text>

              <Text style={styles.alertPreviewMeta}>
                {item.institute}
              </Text>
            </View>

            <Icon
              name="chevron-right"
              color={colors.teal}
              size={21}
            />
          </Pressable>
        ))}

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>
              Weekly inspections
            </Text>
            <Text style={styles.sectionSubtitle}>
              Your field activity at a glance
            </Text>
          </View>

          <Text style={styles.weeklyPercent}>78%</Text>
        </View>

        <Surface style={styles.weeklyCard}>
          <View style={styles.weeklyTop}>
            <View>
              <Text style={styles.weeklyValue}>8 of 10</Text>
              <Text style={styles.weeklyLabel}>
                inspections completed
              </Text>
            </View>

            <View style={styles.weeklyRing}>
              <Text style={styles.weeklyRingText}>80</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: '80%' },
              ]}
            />
          </View>

          <Text style={styles.weeklyFoot}>
            2 inspections remaining · 3 days left in cycle
          </Text>
        </Surface>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>
              Recent inspections
            </Text>
            <Text style={styles.sectionSubtitle}>
              Latest field activity
            </Text>
          </View>

          <Pressable
            onPress={() => onNavigate('institutes')}
          >
            <Text style={styles.seeAll}>View all</Text>
          </Pressable>
        </View>

        {[
          'Rukmini Shelter Home for Women',
          'Nambikkai De-addiction Centre',
        ].map((name, index) => (
          <Pressable
            key={name}
            onPress={() => onNavigate('gps')}
            style={styles.recentRow}
          >
            <View style={styles.recentIcon}>
              <Icon
                name={
                  index === 0
                    ? 'home-city-outline'
                    : 'medical-bag'
                }
                color={colors.teal}
                size={20}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.recentTitle}>{name}</Text>
              <Text style={styles.recentMeta}>
                {index === 0
                  ? 'Completed · 5 Sep 2026'
                  : 'Scheduled · 8 Sep 2026'}
              </Text>
            </View>

            <StatusBadge
              label={index === 0 ? 'Verified' : 'Due soon'}
              tone={index === 0 ? 'success' : 'warning'}
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function AlertsScreen({
  search,
  setSearch,
  onBack,
  onOpen,
  onToast,
}: {
  search: string;
  setSearch: (value: string) => void;
  onBack: () => void;
  onOpen: (item: AlertItem) => void;
  onToast: (message: string) => void;
}) {
  const [filter, setFilter] = useState<
    'All' | 'Critical' | 'High' | 'Medium'
  >('All');

  const filtered = alerts.filter(
    (item) =>
      (filter === 'All' || item.severity === filter) &&
      (item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.institute
          .toLowerCase()
          .includes(search.toLowerCase())),
  );

  return (
    <View style={styles.screen}>
      <AppHeader
        title="AI Anomaly Alerts"
        subtitle="Automatically flagged irregularities"
        onBack={onBack}
        right={
          <Icon
            name="brain"
            color={colors.teal}
            size={30}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by location, event, or time..."
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {['All', 'Critical', 'High', 'Medium'].map(
            (item) => (
              <Chip
                key={item}
                label={`${item} ${
                  item === 'All'
                    ? '(7)'
                    : item === 'Critical'
                      ? '(2)'
                      : item === 'High'
                        ? '(3)'
                        : '(2)'
                }`}
                selected={filter === item}
                tone={
                  item === 'Critical'
                    ? 'red'
                    : item === 'High'
                      ? 'amber'
                      : 'teal'
                }
                onPress={() =>
                  setFilter(item as typeof filter)
                }
              />
            ),
          )}
        </ScrollView>

        <Surface style={styles.aiSummary}>
          <View style={styles.aiSummaryHead}>
            <View style={styles.aiIcon}>
              <Icon
                name="brain"
                color={colors.teal}
                size={20}
              />
            </View>

            <View>
              <Text style={styles.aiSummaryTitle}>
                AI Anomaly Detection
              </Text>
              <Text style={styles.aiSummarySubtitle}>
                Real-time analysis across all active cameras
              </Text>
            </View>

            <Icon
              name="chevron-right"
              color={colors.teal}
              size={21}
            />
          </View>

          <StatStrip
            items={[
              {
                label: 'Total alerts',
                value: '7',
                icon: 'alert-circle-outline',
              },
              {
                label: 'Critical',
                value: '2',
                icon: 'alert-octagon-outline',
                tone: 'red',
              },
              {
                label: 'High',
                value: '3',
                icon: 'bell-alert-outline',
                tone: 'amber',
              },
              {
                label: 'Medium',
                value: '2',
                icon: 'bell-outline',
                tone: 'amber',
              },
            ]}
          />
        </Surface>

        {filtered.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onOpen(item)}
            style={styles.alertCard}
          >
            <ImageThumb
              source={item.image}
              style={styles.alertCardImage}
            />

            <View style={styles.alertCardContent}>
              <View style={styles.alertCardTop}>
                <StatusBadge
                  label={item.severity}
                  tone={
                    item.severity === 'Critical'
                      ? 'critical'
                      : item.severity === 'High'
                        ? 'warning'
                        : 'info'
                  }
                />
                <Text style={styles.alertTime}>
                  {item.time}
                </Text>
              </View>

              <Text style={styles.alertTitle}>
                {item.title}
              </Text>

              <Text style={styles.alertInstitute}>
                <Icon
                  name="map-marker-outline"
                  color={colors.inkMuted}
                  size={14}
                />{' '}
                {item.institute}
              </Text>

              <Text
                numberOfLines={2}
                style={styles.alertDescription}
              >
                {item.description}
              </Text>

              <View style={styles.confidenceRow}>
                <Icon
                  name="brain"
                  color={colors.teal}
                  size={16}
                />

                <Text style={styles.confidenceLabel}>
                  AI Confidence
                </Text>

                <View style={styles.confidenceTrack}>
                  <View
                    style={[
                      styles.confidenceFill,
                      {
                        width: `${item.confidence}%`,
                        backgroundColor:
                          item.severity === 'Critical'
                            ? colors.red
                            : colors.amber,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.confidenceValue}>
                  {item.confidence}%
                </Text>
              </View>

              <View style={styles.alertActions}>
                <SecondaryButton
                  label="Verify by call"
                  icon="phone-outline"
                  onPress={() =>
                    onToast(
                      'Verification call queued for the institute',
                    )
                  }
                  style={styles.smallButton}
                />

                <PrimaryButton
                  label="Escalate"
                  icon="arrow-up-bold-outline"
                  onPress={() =>
                    onToast(
                      'Inspection flow created from this alert',
                    )
                  }
                  style={styles.smallPrimary}
                />
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function AlertDetailScreen({
  item,
  onBack,
  onVerify,
  onEscalate,
}: {
  item: AlertItem;
  onBack: () => void;
  onVerify: () => void;
  onEscalate: () => void;
}) {
  return (
    <View style={styles.screen}>
      <AppHeader
        title="Alert detail"
        subtitle="AI review and response"
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ImageThumb
          source={item.image}
          style={styles.detailImage}
        />

        <StatusBadge
          label={`${item.severity} priority`}
          tone={
            item.severity === 'Critical'
              ? 'critical'
              : item.severity === 'High'
                ? 'warning'
                : 'info'
          }
        />

        <Text style={styles.detailTitle}>
          {item.title}
        </Text>

        <Text style={styles.detailInstitute}>
          {item.institute}
        </Text>

        <Surface style={styles.detailPanel}>
          <Text style={styles.panelHeading}>
            Why this was flagged
          </Text>

          <Text style={styles.bodyText}>
            {item.description}
          </Text>

          <View style={styles.detailMetric}>
            <View>
              <Text style={styles.detailMetricLabel}>
                AI confidence
              </Text>

              <Text style={styles.detailMetricValue}>
                {item.confidence}%
              </Text>
            </View>

            <View style={styles.largeProgress}>
              <View
                style={[
                  styles.confidenceFill,
                  { width: `${item.confidence}%` },
                ]}
              />
            </View>
          </View>

          <Text style={styles.detailMeta}>
            Detected · {item.time}
          </Text>
        </Surface>

        <View style={styles.actionStack}>
          <PrimaryButton
            label="Verify by call"
            icon="phone-outline"
            onPress={onVerify}
          />

          <SecondaryButton
            label="Escalate to inspection"
            icon="arrow-up-bold-outline"
            onPress={onEscalate}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function CCTVScreen({
  search,
  setSearch,
  onBack,
  onOpen,
  onToast,
}: {
  search: string;
  setSearch: (value: string) => void;
  onBack: () => void;
  onOpen: (item: Feed) => void;
  onToast: (message: string) => void;
}) {
  const [filter, setFilter] = useState('All Feeds');

  const filtered = feeds.filter(
    (item) =>
      (filter === 'All Feeds' || item.status === filter) &&
      (item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.institute
          .toLowerCase()
          .includes(search.toLowerCase())),
  );

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Live CCTV"
        subtitle="Real-time feeds across active institutes"
        onBack={onBack}
        right={
          <Icon
            name="cctv"
            color={colors.teal}
            size={30}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search institutes, IDs, district..."
          onFilter={() =>
            onToast('CCTV filters are ready')
          }
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {['All Feeds', 'Live', 'Offline', 'AI Flagged'].map(
            (item) => (
              <Chip
                key={item}
                label={`${item} (${
                  item === 'All Feeds'
                    ? 18
                    : item === 'Live'
                      ? 15
                      : item === 'Offline'
                        ? 3
                        : 4
                })`}
                selected={filter === item}
                onPress={() => setFilter(item)}
              />
            ),
          )}
        </ScrollView>

        <View style={styles.cctvGrid}>
          {filtered.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => onOpen(item)}
              style={styles.cctvCard}
            >
              <View style={styles.cctvImageWrap}>
                <ImageThumb
                  source={item.image}
                  style={styles.cctvImage}
                />

                <View style={styles.livePill}>
                  <View
                    style={[
                      styles.liveDot,
                      item.status === 'AI Flagged' && {
                        backgroundColor: colors.red,
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.livePillText,
                      item.status === 'AI Flagged' && {
                        color: colors.red,
                      },
                    ]}
                  >
                    {item.status === 'AI Flagged'
                      ? 'AI FLAGGED'
                      : 'LIVE'}
                  </Text>
                </View>

                <Text style={styles.cctvTime}>
                  {item.time}
                </Text>

                <View style={styles.cctvExpand}>
                  <Icon
                    name="fullscreen"
                    color={colors.white}
                    size={16}
                  />
                </View>
              </View>

              <View style={styles.cctvCopy}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cctvName}>
                    {item.name}
                  </Text>

                  <Text style={styles.cctvInstitute}>
                    {item.institute}
                  </Text>

                  {Boolean(item.note) && (
                    <StatusBadge
                      label={item.note as string}
                      tone="warning"
                    />
                  )}
                </View>

                <StatusBadge
                  label={
                    item.status === 'AI Flagged'
                      ? 'Review'
                      : 'Live'
                  }
                  tone={
                    item.status === 'AI Flagged'
                      ? 'warning'
                      : 'success'
                  }
                />
              </View>

              <View style={styles.cctvActions}>
                <Pressable
                  onPress={() =>
                    onToast(
                      `${item.name} camera is operational`,
                    )
                  }
                >
                  <Icon
                    name="camera-outline"
                    color={colors.ink}
                    size={20}
                  />
                </Pressable>

                <View style={styles.actionDivider} />

                <Pressable
                  onPress={() =>
                    onToast('Camera settings opened')
                  }
                >
                  <Icon
                    name="cog-outline"
                    color={colors.ink}
                    size={20}
                  />
                </Pressable>

                <Icon
                  name="chevron-right"
                  color={colors.teal}
                  size={22}
                />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function CCTVDetailScreen({
  feed,
  onBack,
}: {
  feed: Feed;
  onBack: () => void;
}) {
  return (
    <View style={styles.screen}>
      <AppHeader
        title={feed.name}
        subtitle={feed.institute}
        onBack={onBack}
        right={<StatusBadge label="Live" />}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.cctvHero}>
          <Image
            source={feed.image}
            style={styles.cctvHeroImage}
          />

          <View style={styles.videoOverlay}>
            <Icon
              name="play-circle-outline"
              color={colors.white}
              size={56}
            />

            <Text style={styles.videoOverlayText}>
              Live preview
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <StatusBadge label="LIVE" />
          <Text style={styles.detailMeta}>
            {feed.time}
          </Text>
        </View>

        <Surface style={styles.detailPanel}>
          <Text style={styles.panelHeading}>
            Camera controls
          </Text>

          <View style={styles.cameraControlRow}>
            {[
              ['volume-high', 'Audio'],
              ['rotate-3d-variant', 'Rotate'],
              ['record-circle-outline', 'Snapshot'],
            ].map(([icon, label]) => (
              <Pressable
                key={label}
                style={styles.cameraControl}
              >
                <Icon
                  name={icon as any}
                  color={colors.teal}
                  size={22}
                />

                <Text style={styles.cameraControlText}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Surface>
      </ScrollView>
    </View>
  );
}

function VideoVerificationScreen({
  onBack,
  onCall,
  onToast,
}: {
  onBack: () => void;
  onCall: () => void;
  onToast: (message: string) => void;
}) {
  const [checked, setChecked] = useState([
    true,
    true,
    true,
    true,
    true,
  ]);

  const labels = [
    'Staff member on duty matches roster',
    'Beneficiaries visible & accounted for',
    'Premises match registered address',
    'No visible safety violations',
    'CCTV cameras operational on-site',
  ];

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Video Verification"
        subtitle="Live call to confirm your presence"
        onBack={onBack}
        dark
        right={
          <View style={styles.secureLabel}>
            <Icon
              name="shield-check-outline"
              color={colors.white}
              size={20}
            />
            <Text style={styles.secureText}>
              Secure &{'\n'}Verified
            </Text>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface dark style={styles.videoCard}>
          <View style={styles.videoCardTop}>
            <StatusBadge label="Random" tone="info" />
            <Text style={styles.timerPill}>◷ 04:58</Text>
          </View>

          <Text style={styles.videoTitle}>
            Start Random{'\n'}Video Verification
          </Text>

          <Text style={styles.videoSubtitle}>
            Unscheduled call to verify real-time presence of staff and
            beneficiaries.
          </Text>

          <View style={styles.inspectorCircle}>
            <Image
              source={inspectorImage}
              style={styles.inspectorPhoto}
            />
          </View>

          <Text style={styles.inspectorName}>Inspector</Text>

          <PrimaryButton
            label="Initiate Random Video Call"
            icon="video-outline"
            onPress={onCall}
            style={styles.videoButton}
          />
        </Surface>

        <Surface style={styles.institutePanel}>
          <View style={styles.instituteIcon}>
            <Icon
              name="bank-outline"
              color={colors.white}
              size={22}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.mutedLabel}>
              Reception of NGO
            </Text>

            <Text style={styles.instituteName}>
              Rukmini Shelter Home
            </Text>

            <Text style={styles.locationLine}>
              <Icon
                name="map-marker-outline"
                color={colors.teal}
                size={15}
              />{' '}
              Nambikkai De-addiction Centre
            </Text>
          </View>

          <Icon
            name="chevron-right"
            color={colors.teal}
            size={22}
          />
        </Surface>

        <Surface style={styles.checklistPanel}>
          <View style={styles.panelHeader}>
            <View style={styles.checklistIcon}>
              <Icon
                name="clipboard-check-outline"
                color={colors.teal}
                size={22}
              />
            </View>

            <Text style={styles.panelHeading}>
              Verification Checklist
            </Text>
          </View>

          {labels.map((label, index) => (
            <Pressable
              key={label}
              onPress={() =>
                setChecked((current) =>
                  current.map((value, itemIndex) =>
                    itemIndex === index ? !value : value,
                  ),
                )
              }
              style={styles.checkRow}
            >
              <View
                style={[
                  styles.checkboxRound,
                  checked[index] &&
                    styles.checkboxRoundChecked,
                ]}
              >
                {checked[index] && (
                  <Icon
                    name="check"
                    color={colors.white}
                    size={13}
                  />
                )}
              </View>

              <Text
                style={[
                  styles.checkLabel,
                  !checked[index] && {
                    color: colors.inkMuted,
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </Surface>

        <Pressable
          onPress={() => onToast('Notes panel opened')}
          style={styles.notesBar}
        >
          <Icon
            name="note-text-outline"
            color={colors.teal}
            size={22}
          />
          <Text style={styles.notesText}>Add Notes</Text>
          <Icon
            name="chevron-right"
            color={colors.teal}
            size={20}
          />
        </Pressable>
      </ScrollView>
    </View>
  );
}

function CallScreen({
  state,
  setState,
  onBack,
}: {
  state: 'idle' | 'connecting' | 'connected' | 'ended';
  setState: (
    value: 'idle' | 'connecting' | 'connected' | 'ended',
  ) => void;
  onBack: () => void;
}) {
  useEffect(() => {
    if (state === 'connecting') {
      const timer = setTimeout(
        () => setState('connected'),
        1500,
      );

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [state, setState]);

  return (
    <View style={styles.callScreen}>
      <View
        style={{
          paddingTop:
            useSafeAreaInsets().top + spacing.sm,
          paddingHorizontal: spacing.xl,
        }}
      >
        <Pressable
          onPress={onBack}
          style={styles.callBack}
        >
          <Icon
            name="arrow-left"
            color={colors.white}
            size={22}
          />
        </Pressable>
      </View>

      <View style={styles.callCenter}>
        <View style={styles.callAvatar}>
          <Text style={styles.callInitials}>AK</Text>
        </View>

        <Text style={styles.callTitle}>
          {state === 'connecting'
            ? 'Connecting…'
            : state === 'connected'
              ? 'Verification call active'
              : state === 'ended'
                ? 'Call ended'
                : 'Ready to connect'}
        </Text>

        <Text style={styles.callSubtitle}>
          {state === 'connecting'
            ? 'Securing a private line with the institute'
            : state === 'connected'
              ? 'Rukmini Shelter Home · Secure line'
              : state === 'ended'
                ? 'Your verification notes have been saved'
                : 'Tap start to begin the demo call'}
        </Text>

        {state === 'connected' && (
          <View style={styles.mockPreview}>
            <Image
              source={feeds[0].image}
              style={styles.mockPreviewImage}
            />

            <View style={styles.mockPreviewBadge}>
              <Icon
                name="video-outline"
                color={colors.white}
                size={16}
              />

              <Text style={styles.mockPreviewText}>
                Institute camera
              </Text>
            </View>
          </View>
        )}

        {state === 'connecting' && (
          <View style={styles.connectingDots}>
            <View />
            <View />
            <View />
          </View>
        )}
      </View>

      <View style={styles.callControls}>
        {state === 'connected' && (
          <Pressable style={styles.callCircle}>
            <Icon
              name="microphone-off"
              color={colors.white}
              size={22}
            />
          </Pressable>
        )}

        {state !== 'ended' && (
          <Pressable
            onPress={() =>
              setState(
                state === 'connected'
                  ? 'ended'
                  : 'connecting',
              )
            }
            style={[
              styles.callCircle,
              styles.endCall,
            ]}
          >
            <Icon
              name={
                state === 'connected'
                  ? 'phone-hangup'
                  : 'video-outline'
              }
              color={colors.white}
              size={24}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <View style={styles.stepper}>
      {[
        'GPS verification',
        'Checklist',
        'Evidence',
        'Submit report',
      ].map((label, index) => (
        <React.Fragment key={label}>
          <View style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                index < step
                  ? styles.stepComplete
                  : index === step
                    ? styles.stepCurrent
                    : styles.stepUpcoming,
              ]}
            >
              {index < step ? (
                <Icon
                  name="check"
                  color={colors.white}
                  size={14}
                />
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    index === step && {
                      color: colors.white,
                    },
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>

            <Text
              style={[
                styles.stepLabel,
                index <= step &&
                  styles.stepLabelActive,
              ]}
            >
              {label}
            </Text>
          </View>

          {index < 3 && (
            <View
              style={[
                styles.stepLine,
                index < step &&
                  styles.stepLineActive,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

function GpsScreen({
  gpsState,
  currentLocation,
  onBack,
  onNext,
  onMap,
}: {
  gpsState: 'checking' | 'verified';
  currentLocation: Location.LocationObjectCoords | null;
  onBack: () => void;
  onNext: () => void;
  onMap: () => void;
}) {
  const currentLatitude =
    currentLocation?.latitude ?? 28.6141;

  const currentLongitude =
    currentLocation?.longitude ?? 77.2088;

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Field Inspection"
        subtitle="On-site verification workflow"
        onBack={onBack}
        dark
        right={
          <View style={styles.secureLabel}>
            <Icon
              name="shield-check-outline"
              color={colors.white}
              size={20}
            />
            <Text style={styles.secureText}>
              Secure &{'\n'}Verified
            </Text>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Stepper step={0} />

        <InstituteBanner />

        <Surface style={styles.gpsPanel}>
          <View style={styles.panelHeader}>
            <View style={styles.gpsIcon}>
              <Icon
                name="map-marker-radius-outline"
                color={colors.teal}
                size={26}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.panelHeading}>
                GPS Verification
              </Text>

              <Text style={styles.panelSubheading}>
                Confirm you are physically present at the
                registered institute address before proceeding.
              </Text>
            </View>

            <SecondaryButton
              label="View on Map"
              icon="map-outline"
              onPress={onMap}
              style={styles.compactButton}
            />
          </View>

          <View style={styles.locationColumns}>
            <View style={styles.locationColumn}>
              <Text style={styles.locationLabel}>
                Registered institute location
              </Text>

              <Text style={styles.locationValue}>
                28.6139° N, 77.2090° E
              </Text>

              <Text style={styles.locationMuted}>
                Rukmini Shelter Home, Sector 12,{'\n'}
                Dwarka, New Delhi
              </Text>
            </View>

            <View style={styles.locationColumn}>
              <Text style={styles.locationLabel}>
                Your current location
              </Text>

              <Text style={styles.locationValue}>
                {currentLatitude.toFixed(4)}° N,{' '}
                {currentLongitude.toFixed(4)}° E
              </Text>

              <Text style={styles.locationMuted}>
                {currentLocation
                  ? `Accuracy: ±${Math.round(
                      currentLocation.accuracy ?? 6,
                    )}m · Captured via device GPS`
                  : 'Waiting for device GPS...'}
              </Text>
            </View>
          </View>

          {Platform.OS === 'web' ? (
            <View style={styles.mapWebFallback}>
              <Icon
                name="map-outline"
                color={colors.teal}
                size={34}
              />

              <Text style={styles.mapFallbackTitle}>
                Live map available on iOS & Android
              </Text>

              <Text style={styles.mapFallbackBody}>
                Open this app in Expo Go on your phone or tablet
                to use the device map and GPS marker.
              </Text>
            </View>
          ) : (
            <MapView
              style={styles.realMap}
              initialRegion={{
                latitude: REGISTERED_LATITUDE,
                longitude: REGISTERED_LONGITUDE,
                latitudeDelta: 0.0045,
                longitudeDelta: 0.0045,
              }}
              region={
                currentLocation
                  ? {
                      latitude: currentLatitude,
                      longitude: currentLongitude,
                      latitudeDelta: 0.0045,
                      longitudeDelta: 0.0045,
                    }
                  : undefined
              }
              showsUserLocation={Boolean(currentLocation)}
              showsMyLocationButton={true}
              loadingEnabled={true}
              mapType="standard"
            >
              <Marker
                coordinate={{
                  latitude: REGISTERED_LATITUDE,
                  longitude: REGISTERED_LONGITUDE,
                }}
                title="Registered Institute"
                description="Rukmini Shelter Home for Women"
                pinColor={colors.teal}
              />

              {currentLocation && (
                <Marker
                  coordinate={{
                    latitude: currentLatitude,
                    longitude: currentLongitude,
                  }}
                  title="Your current location"
                  description="Captured from device GPS"
                  pinColor={colors.red}
                />
              )}
            </MapView>
          )}

          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: colors.teal },
                ]}
              />

              <Text style={styles.legendText}>
                Registered institute
              </Text>
            </View>

            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: colors.red },
                ]}
              />

              <Text style={styles.legendText}>
                Your current GPS location
              </Text>
            </View>
          </View>

          <View style={styles.verifiedBar}>
            <View style={styles.verifiedIcon}>
              <Icon
                name={
                  gpsState === 'checking'
                    ? 'crosshairs-gps'
                    : 'check'
                }
                color={colors.white}
                size={22}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.verifiedTitle}>
                {gpsState === 'checking'
                  ? 'Checking GPS…'
                  : 'Location verified successfully'}
              </Text>

              <Text style={styles.verifiedBody}>
                {gpsState === 'checking'
                  ? 'Confirming your device location'
                  : 'Within 12m of the registered institute address.  •  Recorded at 4:25:09 PM'}
              </Text>
            </View>
          </View>
        </Surface>

        <Surface style={styles.proceedPanel}>
          <View style={styles.checklistIcon}>
            <Icon
              name="clipboard-check-outline"
              color={colors.teal}
              size={22}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.panelHeading}>
              Proceed to Checklist
            </Text>

            <Text style={styles.panelSubheading}>
              Now verify the on-site conditions as per the
              checklist before moving to the next step.
            </Text>
          </View>

          <PrimaryButton
            label="Go to Checklist"
            icon="arrow-right"
            onPress={onNext}
            disabled={gpsState !== 'verified'}
            style={styles.proceedButton}
          />
        </Surface>

        <SecondaryButton
          label="Back"
          icon="arrow-left"
          onPress={onBack}
          style={styles.backWide}
        />
      </ScrollView>
    </View>
  );
}

function InstituteBanner() {
  return (
    <Surface style={styles.instituteBanner}>
      <View style={styles.instituteIcon}>
        <Icon
          name="bank-outline"
          color={colors.white}
          size={21}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.instituteName}>
          Rukmini Shelter Home for Women
        </Text>

        <Text style={styles.instituteMeta}>
          Institute ID: MSJE/DL/00231   ·   Inspection ref:
          INS-2026-08841
        </Text>
      </View>
    </Surface>
  );
}

function ChecklistScreen({
  checklist,
  toggle,
  onBack,
  onNext,
  onToast,
}: {
  checklist: boolean[];
  toggle: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
  onToast: (message: string) => void;
}) {
  const completed = checklist.filter(Boolean).length;

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Field Inspection"
        subtitle="On-site verification workflow"
        onBack={onBack}
        dark
        right={
          <View style={styles.secureLabel}>
            <Icon
              name="shield-check-outline"
              color={colors.white}
              size={20}
            />
            <Text style={styles.secureText}>
              Secure &{'\n'}Verified
            </Text>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <InstituteBanner />
        <Stepper step={1} />

        <Surface style={styles.checklistPanelLarge}>
          <View style={styles.panelHeader}>
            <View style={styles.checklistIcon}>
              <Icon
                name="clipboard-check-outline"
                color={colors.teal}
                size={22}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.panelHeading}>
                Inspection checklist
              </Text>

              <Text style={styles.panelSubheading}>
                {completed} / {checklist.length} completed
              </Text>
            </View>

            <StatusBadge
              label={
                completed === checklist.length
                  ? 'Complete'
                  : 'In progress'
              }
              tone={
                completed === checklist.length
                  ? 'success'
                  : 'warning'
              }
            />
          </View>

          {checklistItems.map((item, index) => (
            <Pressable
              key={item}
              onPress={() => toggle(index)}
              style={styles.checkRow}
            >
              <View
                style={[
                  styles.checkboxRound,
                  checklist[index] &&
                    styles.checkboxRoundChecked,
                ]}
              >
                {checklist[index] && (
                  <Icon
                    name="check"
                    color={colors.white}
                    size={13}
                  />
                )}
              </View>

              <Text style={styles.checkLabel}>
                {item}
              </Text>
            </Pressable>
          ))}
        </Surface>

        <Surface style={styles.locationVerifiedSmall}>
          <Icon
            name="map-marker-check-outline"
            color={colors.success}
            size={22}
          />

          <Text style={styles.locationVerifiedText}>
            Location verified at registered address
          </Text>
        </Surface>

        <View style={styles.bottomActions}>
          <SecondaryButton
            label="Back"
            icon="arrow-left"
            onPress={onBack}
          />

          <PrimaryButton
            label="Continue to Evidence"
            icon="arrow-right"
            onPress={() =>
              completed > 0
                ? onNext()
                : onToast(
                    'Complete at least one checklist item to continue',
                  )
            }
            style={styles.flexButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function EvidenceScreen({
  evidence,
  onBack,
  onAdd,
  onNext,
}: {
  evidence: {
    id: string;
    title: string;
    image: number | { uri: string };
    time: string;
    coords: string;
  }[];
  onBack: () => void;
  onAdd: (kind: 'photo' | 'video') => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.screen}>
      <AppHeader
        title="Field Inspection"
        subtitle="On-site verification workflow"
        onBack={onBack}
        dark
        right={
          <View style={styles.secureLabel}>
            <Icon
              name="shield-check-outline"
              color={colors.white}
              size={20}
            />
            <Text style={styles.secureText}>
              Secure &{'\n'}Verified
            </Text>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <InstituteBanner />
        <Stepper step={2} />

        <Surface style={styles.evidencePanel}>
          <View style={styles.panelHeader}>
            <View style={styles.checklistIcon}>
              <Icon
                name="camera-outline"
                color={colors.teal}
                size={22}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.panelHeading}>
                Photo & video evidence
              </Text>

              <Text style={styles.panelSubheading}>
                Capture geotagged evidence of premises, records
                and beneficiary facilities.
              </Text>
            </View>
          </View>

          <View style={styles.evidenceButtons}>
            <SecondaryButton
              label="Add Photo Evidence"
              icon="camera-outline"
              onPress={() => onAdd('photo')}
              style={styles.flexButton}
            />

            <SecondaryButton
              label="Add Video Clip"
              icon="video-outline"
              onPress={() => onAdd('video')}
              style={styles.flexButton}
            />
          </View>

          <View style={styles.galleryHeader}>
            <Text style={styles.panelHeading}>
              Evidence Gallery ({evidence.length}/3)
            </Text>

            <StatusBadge
              label={`${evidence.length >= 3 ? '3 of 3' : evidence.length} required`}
            />
          </View>

          {evidence.map((item) => (
            <View
              key={item.id}
              style={styles.evidenceRow}
            >
              <ImageThumb
                source={item.image}
                style={styles.evidenceImage}
              />

              <View style={styles.evidenceCopy}>
                <View style={styles.evidenceBadges}>
                  <StatusBadge
                    label="Geotagged"
                    tone="info"
                  />
                  <StatusBadge
                    label="Verified"
                    tone="success"
                  />
                </View>

                <Text style={styles.evidenceTitle}>
                  {item.title}
                </Text>

                <Text style={styles.evidenceMeta}>
                  <Icon
                    name="calendar-outline"
                    size={13}
                    color={colors.inkMuted}
                  />{' '}
                  6 Sep 2026, {item.time}
                </Text>

                <Text style={styles.evidenceMeta}>
                  <Icon
                    name="map-marker-outline"
                    size={13}
                    color={colors.inkMuted}
                  />{' '}
                  {item.coords}
                </Text>
              </View>

              <Icon
                name="dots-vertical"
                color={colors.inkMuted}
                size={20}
              />
            </View>
          ))}

          <View style={styles.bottomActions}>
            <SecondaryButton
              label="Back"
              icon="arrow-left"
              onPress={onBack}
            />

            <PrimaryButton
              label="Continue to Report"
              icon="arrow-right"
              onPress={onNext}
              style={styles.flexButton}
            />
          </View>
        </Surface>
      </ScrollView>
    </View>
  );
}

function ReportScreen({
  checklist,
  evidenceCount,
  assessment,
  setAssessment,
  remarks,
  setRemarks,
  submitted,
  submitting,
  onBack,
  onSubmit,
  onDone,
}: {
  checklist: boolean[];
  evidenceCount: number;
  assessment:
    | 'Satisfactory'
    | 'Needs improvement'
    | 'Critical issues found';
  setAssessment: (
    value:
      | 'Satisfactory'
      | 'Needs improvement'
      | 'Critical issues found',
  ) => void;
  remarks: string;
  setRemarks: (value: string) => void;
  submitted: boolean;
  submitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
  onDone: () => void;
}) {
  if (submitted) {
    return (
      <View style={styles.successScreen}>
        <View style={styles.successCircle}>
          <Icon
            name="check"
            color={colors.white}
            size={42}
          />
        </View>

        <Text style={styles.successTitle}>
          Inspection submitted successfully
        </Text>

        <Text style={styles.successBody}>
          Your report for Rukmini Shelter Home for Women has
          been securely recorded.
        </Text>

        <PrimaryButton
          label="Return to dashboard"
          icon="home-outline"
          onPress={onDone}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Field Inspection"
        subtitle="On-site verification workflow"
        onBack={onBack}
        dark
        right={
          <View style={styles.secureLabel}>
            <Icon
              name="shield-check-outline"
              color={colors.white}
              size={20}
            />
            <Text style={styles.secureText}>
              Secure &{'\n'}Verified
            </Text>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <InstituteBanner />
        <Stepper step={3} />

        <Surface style={styles.reportPanel}>
          <Text style={styles.panelHeading}>
            Report summary & submission
          </Text>

          <View style={styles.summaryGrid}>
            {[
              [
                'GPS location',
                'Verified',
                'map-marker-check-outline',
              ],
              [
                'Checklist completed',
                `${checklist.filter(Boolean).length} / ${checklist.length}`,
                'clipboard-check-outline',
              ],
              [
                'Evidence attached',
                `${evidenceCount} files`,
                'paperclip',
              ],
              [
                'Inspection date & time',
                '7 Sep 2026 · 09:41',
                'calendar-outline',
              ],
            ].map(([label, value, icon]) => (
              <View
                key={label}
                style={styles.summaryCell}
              >
                <Icon
                  name={icon as any}
                  color={colors.teal}
                  size={18}
                />

                <Text style={styles.summaryLabel}>
                  {label}
                </Text>

                <Text style={styles.summaryValue}>
                  {value}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.formSectionTitle}>
            Overall assessment
          </Text>

          <View style={styles.assessmentRow}>
            {[
              'Satisfactory',
              'Needs improvement',
              'Critical issues found',
            ].map((item) => (
              <Pressable
                key={item}
                onPress={() =>
                  setAssessment(
                    item as
                      | 'Satisfactory'
                      | 'Needs improvement'
                      | 'Critical issues found',
                  )
                }
                style={[
                  styles.assessmentButton,
                  assessment === item &&
                    styles.assessmentSelected,
                ]}
              >
                <View
                  style={[
                    styles.radio,
                    assessment === item &&
                      styles.radioSelected,
                  ]}
                />

                <Text
                  style={[
                    styles.assessmentText,
                    assessment === item &&
                      styles.assessmentTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>

          <Field
            label="Officer remarks"
            value={remarks}
            onChangeText={setRemarks}
            placeholder="Add any observations or follow-up actions..."
            multiline
          />

          <PrimaryButton
            label={
              submitting
                ? 'Submitting inspection…'
                : 'Submit inspection report'
            }
            icon="send-outline"
            loading={submitting}
            onPress={onSubmit}
            style={{ marginTop: spacing.lg }}
          />
        </Surface>
      </ScrollView>
    </View>
  );
}

function AssignmentScreen({
  institutes,
  search,
  setSearch,
  onBack,
  onAssign,
  onViewAll,
}: {
  institutes: {
    id: string;
    name: string;
    district: string;
    riskScore: number;
    lastInspection: string;
    priority: Risk;
    assignedTo: string;
  }[];
  search: string;
  setSearch: (value: string) => void;
  onBack: () => void;
  onAssign: (id: string, officer: string) => void;
  onViewAll: () => void;
}) {
  const filtered = institutes.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.district
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Assign Inspections"
        subtitle="District-wise inspection workload"
        onBack={onBack}
        right={
          <View style={styles.headerActions}>
            <Icon
              name="bell-outline"
              color={colors.ink}
              size={21}
            />
            <Text style={styles.dateText}>09:41</Text>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search institutes or districts..."
        />

        <StatStrip
          items={[
            {
              label: 'Pending',
              value: '154',
              icon: 'clipboard-alert-outline',
              tone: 'amber',
            },
            {
              label: 'Assigned this week',
              value: '42',
              icon: 'account-check-outline',
            },
            {
              label: 'Overdue > 7 days',
              value: '28',
              icon: 'clock-alert-outline',
              tone: 'red',
            },
            {
              label: 'Officers active',
              value: '19',
              icon: 'account-group-outline',
            },
          ]}
        />

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>
              Institutes requiring inspection
            </Text>

            <Text style={styles.sectionSubtitle}>
              Assign active field officers
            </Text>
          </View>
        </View>

        {filtered.map((item) => (
          <AssignmentCard
            key={item.id}
            item={item}
            onAssign={onAssign}
          />
        ))}

        <SecondaryButton
          label="View all institutes"
          icon="arrow-right"
          onPress={onViewAll}
        />
      </ScrollView>
    </View>
  );
}

function AssignmentCard({
  item,
  onAssign,
}: {
  item: {
    id: string;
    name: string;
    district: string;
    riskScore: number;
    lastInspection: string;
    priority: Risk;
    assignedTo: string;
  };
  onAssign: (id: string, officer: string) => void;
}) {
  const [selected, setSelected] = useState(item.assignedTo);
  const [open, setOpen] = useState(false);

  return (
    <Surface style={styles.assignmentCard}>
      <View style={styles.assignmentTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.assignmentTitle}>
            {item.name}
          </Text>

          <Text style={styles.assignmentMeta}>
            {item.district} · Last inspection{' '}
            {item.lastInspection}
          </Text>
        </View>

        <StatusBadge
          label={item.priority}
          tone={
            item.priority === 'High'
              ? 'critical'
              : 'warning'
          }
        />
      </View>

      <View style={styles.assignmentBottom}>
        <View>
          <Text style={styles.riskLabel}>Risk score</Text>
          <Text
            style={[
              styles.riskValue,
              {
                color:
                  item.riskScore > 70
                    ? colors.red
                    : colors.amber,
              },
            ]}
          >
            {item.riskScore}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.riskLabel}>Assign to</Text>

          <Pressable
            onPress={() => setOpen(!open)}
            style={styles.officerSelect}
          >
            <Text style={styles.officerText}>
              {selected}
            </Text>

            <Icon
              name="chevron-down"
              color={colors.teal}
              size={18}
            />
          </Pressable>

          {open && (
            <View style={styles.officerMenu}>
              {officers.map((officer) => (
                <Pressable
                  key={officer}
                  onPress={() => {
                    setSelected(officer);
                    setOpen(false);
                  }}
                  style={styles.officerOption}
                >
                  <Text style={styles.officerOptionText}>
                    {officer}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <PrimaryButton
          label="Assign"
          onPress={() => onAssign(item.id, selected)}
          style={styles.assignButton}
        />
      </View>
    </Surface>
  );
}

function InstitutesScreen({
  institutes,
  search,
  setSearch,
  onBack,
  onInspect,
}: {
  institutes: {
    id: string;
    name: string;
    district: string;
    riskScore: number;
    lastInspection: string;
    priority: Risk;
    assignedTo: string;
  }[];
  search: string;
  setSearch: (value: string) => void;
  onBack: () => void;
  onInspect: () => void;
}) {
  const filtered = institutes.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.district
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Institutes"
        subtitle="Registered care institutions"
        onBack={onBack}
        right={
          <Icon
            name="bank-outline"
            color={colors.teal}
            size={29}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by institute or district..."
        />

        <View style={styles.instituteCount}>
          <Text style={styles.sectionTitle}>
            {filtered.length} institutes
          </Text>

          <StatusBadge label="All monitored" />
        </View>

        {filtered.map((item) => (
          <Pressable
            key={item.id}
            onPress={onInspect}
            style={styles.instituteListCard}
          >
            <View style={styles.instituteListIcon}>
              <Icon
                name="bank-outline"
                color={colors.teal}
                size={22}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.instituteName}>
                {item.name}
              </Text>

              <Text style={styles.instituteMeta}>
                {item.district} · {item.id}
              </Text>

              <View style={styles.instituteStatusRow}>
                <StatusBadge
                  label={`${item.riskScore} risk score`}
                  tone={
                    item.riskScore > 70
                      ? 'critical'
                      : 'warning'
                  }
                />

                <Text style={styles.assignedText}>
                  {item.assignedTo === 'Unassigned'
                    ? 'Needs officer'
                    : item.assignedTo}
                </Text>
              </View>
            </View>

            <Icon
              name="chevron-right"
              color={colors.teal}
              size={20}
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function NotificationsScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  return (
    <View style={styles.screen}>
      <AppHeader
        title="Notifications"
        subtitle="Updates that need your attention"
        onBack={onBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {[
          [
            'alert-circle-outline',
            '2 critical AI alerts need review',
            'AI monitoring · 8 minutes ago',
            'critical',
          ],
          [
            'clipboard-check-outline',
            'Inspection due tomorrow',
            'Rukmini Shelter Home · 2 hours ago',
            'success',
          ],
          [
            'video-outline',
            'Random video verification available',
            'Your verification window is open',
            'info',
          ],
        ].map(([icon, title, meta, tone]) => (
          <Surface
            key={title}
            style={styles.fullNotification}
          >
            <View
              style={[
                styles.notificationIcon,
                tone === 'critical'
                  ? styles.notificationRed
                  : tone === 'info'
                    ? styles.notificationBlue
                    : styles.notificationGreen,
              ]}
            >
              <Icon
                name={icon as any}
                color={
                  tone === 'critical'
                    ? colors.red
                    : tone === 'info'
                      ? colors.blue
                      : colors.success
                }
                size={20}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.notificationTitle}>
                {title}
              </Text>

              <Text style={styles.notificationMeta}>
                {meta}
              </Text>
            </View>

            <Icon
              name="chevron-right"
              color={colors.teal}
              size={20}
            />
          </Surface>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: colors.ivory,
  },

  screen: {
    flex: 1,
    backgroundColor: colors.ivory,
  },

  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 112,
    gap: spacing.lg,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  headerIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  alertDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.red,
    borderWidth: 1,
    borderColor: colors.ivory,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: typography.weightBold,
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },

  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  greeting: {
    color: colors.ink,
    fontSize: typography.title,
    fontWeight: typography.weightBold,
  },

  greetingMeta: {
    color: colors.inkMuted,
    fontSize: 12,
    marginTop: 4,
  },

  dateText: {
    color: colors.inkMuted,
    fontSize: 10,
    textAlign: 'right',
    lineHeight: 15,
  },

  chipRow: {
    gap: spacing.sm,
    paddingVertical: 2,
  },

  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.sm,
  },

  sectionTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: typography.weightBold,
  },

  sectionSubtitle: {
    color: colors.inkMuted,
    fontSize: 11,
    marginTop: 3,
  },

  seeAll: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: typography.weightBold,
  },

  alertPreview: {
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  alertPreviewImage: {
    width: 64,
    height: 64,
    borderRadius: radii.sm,
  },

  alertPreviewBody: {
    flex: 1,
    gap: 3,
  },

  alertPreviewTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: typography.weightBold,
  },

  alertPreviewMeta: {
    color: colors.inkMuted,
    fontSize: 10,
  },

  weeklyCard: {
    padding: spacing.lg,
  },

  weeklyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  weeklyValue: {
    color: colors.ink,
    fontSize: 23,
    fontWeight: typography.weightBold,
  },

  weeklyLabel: {
    color: colors.inkMuted,
    fontSize: 12,
    marginTop: 2,
  },

  weeklyPercent: {
    color: colors.teal,
    fontSize: 12,
    fontWeight: typography.weightBold,
  },

  weeklyRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 7,
    borderColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },

  weeklyRingText: {
    color: colors.teal,
    fontSize: 15,
    fontWeight: typography.weightBold,
  },

  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.paperDeep,
    overflow: 'hidden',
    marginTop: spacing.lg,
  },

  progressFill: {
    height: '100%',
    backgroundColor: colors.teal,
    borderRadius: 4,
  },

  weeklyFoot: {
    color: colors.inkMuted,
    fontSize: 11,
    marginTop: spacing.sm,
  },

  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },

  recentIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  recentTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: typography.weightSemibold,
  },

  recentMeta: {
    color: colors.inkMuted,
    fontSize: 11,
    marginTop: 3,
  },

  aiSummary: {
    padding: spacing.md,
  },

  aiSummaryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },

  aiIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiSummaryTitle: {
    color: colors.ink,
    fontWeight: typography.weightBold,
    fontSize: 13,
  },

  aiSummarySubtitle: {
    color: colors.inkMuted,
    fontSize: 10,
    marginTop: 2,
    flex: 1,
  },

  alertCard: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: spacing.sm,
    flexDirection: 'row',
    gap: spacing.md,
  },

  alertCardImage: {
    width: 84,
    height: 104,
    borderRadius: radii.sm,
  },

  alertCardContent: {
    flex: 1,
    gap: 5,
  },

  alertCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  alertTime: {
    color: colors.inkMuted,
    fontSize: 9,
  },

  alertTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: typography.weightBold,
  },

  alertInstitute: {
    color: colors.inkMuted,
    fontSize: 10,
  },

  alertDescription: {
    color: colors.inkMuted,
    fontSize: 10,
    lineHeight: 14,
  },

  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  confidenceLabel: {
    color: colors.inkMuted,
    fontSize: 9,
  },

  confidenceTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.paperDeep,
    borderRadius: 2,
    overflow: 'hidden',
  },

  confidenceFill: {
    height: '100%',
    backgroundColor: colors.teal,
    borderRadius: 2,
  },

  confidenceValue: {
    color: colors.inkMuted,
    fontSize: 9,
  },

  alertActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  smallButton: {
    minHeight: 30,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    flex: 1,
  },

  smallPrimary: {
    minHeight: 30,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
    flex: 1,
  },

  detailImage: {
    height: 210,
  },

  detailTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: typography.weightBold,
    marginTop: spacing.sm,
  },

  detailInstitute: {
    color: colors.inkMuted,
    fontSize: 13,
  },

  detailPanel: {
    padding: spacing.lg,
    gap: spacing.md,
  },

  panelHeading: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: typography.weightBold,
  },

  bodyText: {
    color: colors.inkMuted,
    fontSize: 13,
    lineHeight: 20,
  },

  detailMetric: {
    gap: spacing.sm,
  },

  detailMetricLabel: {
    color: colors.inkMuted,
    fontSize: 11,
  },

  detailMetricValue: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: typography.weightBold,
  },

  largeProgress: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.paperDeep,
    overflow: 'hidden',
  },

  detailMeta: {
    color: colors.inkMuted,
    fontSize: 11,
  },

  actionStack: {
    gap: spacing.md,
  },

  cctvGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  cctvCard: {
    width: '48%',
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },

  cctvImageWrap: {
    height: 145,
    position: 'relative',
  },

  cctvImage: {
    height: '100%',
    borderRadius: 0,
  },

  livePill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#073B3ACC',
    borderRadius: radii.pill,
    paddingHorizontal: 7,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#72E8C5',
  },

  livePillText: {
    color: '#B8F4E2',
    fontSize: 9,
    fontWeight: typography.weightBold,
  },

  cctvTime: {
    position: 'absolute',
    top: 8,
    right: 8,
    color: colors.white,
    fontSize: 9,
    backgroundColor: '#073B3ACC',
    borderRadius: radii.pill,
    padding: 5,
  },

  cctvExpand: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#073B3ACC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cctvCopy: {
    padding: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
  },

  cctvName: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: typography.weightBold,
  },

  cctvInstitute: {
    color: colors.inkMuted,
    fontSize: 9,
    marginTop: 3,
    minHeight: 24,
  },

  cctvActions: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  actionDivider: {
    height: 20,
    width: 1,
    backgroundColor: colors.line,
  },

  cctvHero: {
    height: 260,
    borderRadius: radii.lg,
    overflow: 'hidden',
    position: 'relative',
  },

  cctvHeroImage: {
    width: '100%',
    height: '100%',
  },

  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#073B3A55',
    alignItems: 'center',
    justifyContent: 'center',
  },

  videoOverlayText: {
    color: colors.white,
    fontWeight: typography.weightSemibold,
    marginTop: spacing.sm,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cameraControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  cameraControl: {
    alignItems: 'center',
    gap: spacing.sm,
  },

  cameraControlText: {
    color: colors.inkMuted,
    fontSize: 11,
  },

  secureLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  secureText: {
    color: colors.white,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: typography.weightSemibold,
  },

  videoCard: {
    minHeight: 290,
    padding: spacing.xl,
    overflow: 'hidden',
  },

  videoCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  timerPill: {
    color: colors.white,
    borderWidth: 1,
    borderColor: '#A4DBD0',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    fontSize: 12,
  },

  videoTitle: {
    color: colors.white,
    fontSize: 23,
    fontWeight: typography.weightBold,
    marginTop: spacing.lg,
  },

  videoSubtitle: {
    color: '#C6E3DC',
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
    maxWidth: '75%',
  },

  inspectorCircle: {
    position: 'absolute',
    right: 30,
    top: 102,
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  inspectorPhoto: {
    width: '100%',
    height: '100%',
  },

  inspectorName: {
    position: 'absolute',
    right: 50,
    top: 198,
    color: colors.white,
    fontSize: 11,
  },

  videoButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
    backgroundColor: colors.teal,
  },

  institutePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },

  instituteIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mutedLabel: {
    color: colors.inkMuted,
    fontSize: 11,
  },

  instituteName: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: typography.weightBold,
    marginTop: 2,
  },

  locationLine: {
    color: colors.inkMuted,
    fontSize: 11,
    marginTop: spacing.md,
  },

  checklistPanel: {
    padding: spacing.lg,
  },

  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  checklistIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },

  checkLabel: {
    flex: 1,
    color: colors.ink,
    fontSize: 12,
  },

  checkboxRound: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.inkMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxRoundChecked: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },

  notesBar: {
    height: 50,
    backgroundColor: colors.tealSoft,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  notesText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: typography.weightSemibold,
    flex: 1,
  },

  callScreen: {
    flex: 1,
    backgroundColor: colors.tealDeep,
  },

  callBack: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF1A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  callCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },

  callAvatar: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: colors.teal,
    borderWidth: 3,
    borderColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },

  callInitials: {
    color: colors.white,
    fontSize: 30,
    fontWeight: typography.weightBold,
  },

  callTitle: {
    color: colors.white,
    fontSize: 21,
    fontWeight: typography.weightBold,
    marginTop: spacing.xl,
    textAlign: 'center',
  },

  callSubtitle: {
    color: '#C6E3DC',
    fontSize: 13,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  connectingDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.xl,
  },

  mockPreview: {
    marginTop: spacing.xl,
    width: '100%',
    height: 150,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFFFFF33',
  },

  mockPreviewImage: {
    width: '100%',
    height: '100%',
  },

  mockPreviewBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },

  mockPreviewText: {
    color: colors.white,
    fontSize: 11,
  },

  callControls: {
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.lg,
  },

  callCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },

  endCall: {
    backgroundColor: colors.red,
  },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
  },

  stepItem: {
    alignItems: 'center',
    gap: 4,
    maxWidth: 62,
  },

  stepCircle: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepComplete: {
    backgroundColor: colors.teal,
  },

  stepCurrent: {
    backgroundColor: colors.tealDeep,
  },

  stepUpcoming: {
    backgroundColor: colors.paperDeep,
  },

  stepNumber: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: typography.weightBold,
  },

  stepLabel: {
    color: colors.inkMuted,
    fontSize: 8,
    textAlign: 'center',
  },

  stepLabelActive: {
    color: colors.ink,
    fontWeight: typography.weightBold,
  },

  stepLine: {
    height: 1,
    backgroundColor: colors.line,
    flex: 1,
    marginHorizontal: 4,
  },

  stepLineActive: {
    backgroundColor: colors.teal,
  },

  instituteBanner: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  instituteMeta: {
    color: colors.inkMuted,
    fontSize: 10,
    marginTop: 4,
  },

  gpsPanel: {
    padding: spacing.lg,
    gap: spacing.lg,
  },

  panelSubheading: {
    color: colors.inkMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  gpsIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  compactButton: {
    minHeight: 34,
    paddingHorizontal: spacing.sm,
  },

  locationColumns: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
  },

  locationColumn: {
    flex: 1,
    padding: spacing.md,
    gap: 4,
  },

  locationLabel: {
    color: colors.inkMuted,
    fontSize: 10,
  },

  locationValue: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: typography.weightBold,
  },

  locationMuted: {
    color: colors.inkMuted,
    fontSize: 9,
    lineHeight: 13,
  },

  realMap: {
    height: 230,
    width: '100%',
    borderRadius: radii.md,
    overflow: 'hidden',
  },

  mapWebFallback: {
    height: 230,
    borderRadius: radii.md,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },

  mapFallbackTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: typography.weightBold,
    marginTop: spacing.md,
    textAlign: 'center',
  },

  mapFallbackBody: {
    color: colors.inkMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  mapLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    alignItems: 'center',
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  legendText: {
    color: colors.inkMuted,
    fontSize: 10,
  },

  verifiedBar: {
    backgroundColor: colors.successSoft,
    borderRadius: radii.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#BFE6D7',
  },

  verifiedIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  verifiedTitle: {
    color: colors.success,
    fontSize: 15,
    fontWeight: typography.weightBold,
  },

  verifiedBody: {
    color: colors.teal,
    fontSize: 11,
    marginTop: 5,
    lineHeight: 16,
  },

  proceedPanel: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  proceedButton: {
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },

  backWide: {
    alignSelf: 'flex-start',
  },

  checklistPanelLarge: {
    padding: spacing.lg,
  },

  locationVerifiedSmall: {
    padding: spacing.md,
    backgroundColor: colors.successSoft,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },

  locationVerifiedText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: typography.weightSemibold,
  },

  bottomActions: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },

  flexButton: {
    flex: 1,
  },

  evidencePanel: {
    padding: spacing.lg,
  },

  evidenceButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },

  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  evidenceRow: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
  },

  evidenceImage: {
    width: 105,
    height: 88,
    borderRadius: radii.sm,
  },

  evidenceCopy: {
    flex: 1,
    gap: 4,
  },

  evidenceBadges: {
    flexDirection: 'row',
    gap: 4,
  },

  evidenceTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: typography.weightBold,
  },

  evidenceMeta: {
    color: colors.inkMuted,
    fontSize: 9,
  },

  reportPanel: {
    padding: spacing.lg,
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
  },

  summaryCell: {
    width: '50%',
    padding: spacing.md,
    gap: 3,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },

  summaryLabel: {
    color: colors.inkMuted,
    fontSize: 10,
  },

  summaryValue: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: typography.weightBold,
  },

  formSectionTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: typography.weightBold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  assessmentRow: {
    gap: spacing.sm,
  },

  assessmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
  },

  assessmentSelected: {
    backgroundColor: colors.tealSoft,
    borderColor: colors.teal,
  },

  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.inkMuted,
  },

  radioSelected: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },

  assessmentText: {
    color: colors.inkMuted,
    fontSize: 12,
  },

  assessmentTextSelected: {
    color: colors.ink,
    fontWeight: typography.weightSemibold,
  },

  assignmentCard: {
    padding: spacing.lg,
  },

  assignmentTop: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  assignmentTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: typography.weightBold,
  },

  assignmentMeta: {
    color: colors.inkMuted,
    fontSize: 10,
    marginTop: 4,
  },

  assignmentBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.lg,
  },

  riskLabel: {
    color: colors.inkMuted,
    fontSize: 10,
  },

  riskValue: {
    fontSize: 23,
    fontWeight: typography.weightBold,
    marginTop: 2,
  },

  officerSelect: {
    height: 40,
    minWidth: 130,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  officerText: {
    color: colors.ink,
    fontSize: 11,
    flex: 1,
  },

  officerMenu: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    backgroundColor: colors.paper,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.line,
    zIndex: 4,
    elevation: 5,
  },

  officerOption: {
    padding: spacing.sm,
  },

  officerOptionText: {
    color: colors.ink,
    fontSize: 11,
  },

  assignButton: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },

  instituteCount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  instituteListCard: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  instituteListIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  instituteStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  assignedText: {
    color: colors.inkMuted,
    fontSize: 10,
  },

  fullNotification: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.redSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationRed: {
    backgroundColor: colors.redSoft,
  },

  notificationGreen: {
    backgroundColor: colors.successSoft,
  },

  notificationBlue: {
    backgroundColor: colors.blueSoft,
  },

  notificationTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: typography.weightSemibold,
  },

  notificationMeta: {
    color: colors.inkMuted,
    fontSize: 10,
    marginTop: 3,
  },

  modalBody: {
    color: colors.inkMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.lg,
  },

  toast: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    minHeight: 46,
    borderRadius: radii.md,
    backgroundColor: colors.tealDeep,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    elevation: 8,
  },

  toastText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: typography.weightSemibold,
  },

  errorBox: {
    padding: spacing.md,
    backgroundColor: colors.redSoft,
    borderRadius: radii.md,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },

  errorText: {
    color: colors.red,
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },

  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  profileAvatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.teal,
    overflow: 'hidden',
  },

  profileAvatarImage: {
    width: '100%',
    height: '100%',
  },

  profileName: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: typography.weightBold,
  },

  profileMeta: {
    color: colors.inkMuted,
    fontSize: 10,
    marginTop: 3,
  },

  profileDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginBottom: spacing.lg,
  },

  profileSectionTitle: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: typography.weightBold,
    marginBottom: spacing.sm,
  },

  profileBody: {
    color: colors.inkMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },

  signOutButton: {
    borderColor: colors.red,
  },

  loginShell: {
    flex: 1,
    backgroundColor: colors.ivory,
  },

  loginBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },

  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loginBrandTitle: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: typography.weightBold,
  },

  loginBrandSub: {
    color: colors.inkMuted,
    fontSize: 10,
    marginTop: 2,
  },

  loginHero: {
    color: colors.ink,
    fontSize: 31,
    lineHeight: 35,
    fontWeight: typography.weightBold,
    letterSpacing: -0.8,
    paddingHorizontal: spacing.xl,
    marginTop: 34,
  },

  loginIntro: {
    color: colors.inkMuted,
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
    maxWidth: 330,
  },

  loginStats: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },

  loginStat: {
    flex: 1,
    paddingRight: spacing.sm,
  },

  loginStatValue: {
    color: colors.teal,
    fontSize: 18,
    fontWeight: typography.weightBold,
  },

  loginStatLabel: {
    color: colors.inkMuted,
    fontSize: 9,
    lineHeight: 12,
    marginTop: 3,
  },

  loginCard: {
    margin: spacing.xl,
    padding: spacing.xl,
    gap: spacing.lg,
  },

  loginTitle: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: typography.weightBold,
  },

  loginSubtitle: {
    color: colors.inkMuted,
    fontSize: 12,
    marginTop: -spacing.sm,
  },

  roleLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: typography.weightSemibold,
    marginTop: spacing.sm,
  },

  roleRow: {
    gap: spacing.sm,
  },

  roleButton: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  roleButtonActive: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },

  roleText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: typography.weightSemibold,
  },

  roleTextActive: {
    color: colors.white,
  },

  loginOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },

  checkLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },

  forgotButton: {
    marginLeft: spacing.md,
    flexShrink: 0,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.inkMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxChecked: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },

  linkText: {
    color: colors.teal,
    fontSize: 11,
    fontWeight: typography.weightBold,
  },

  auditNote: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    paddingTop: spacing.sm,
  },

  auditText: {
    color: colors.inkMuted,
    fontSize: 10,
    lineHeight: 14,
    flex: 1,
  },

  demoHint: {
    textAlign: 'center',
    color: colors.inkMuted,
    fontSize: 10,
    marginTop: -spacing.sm,
  },

  successScreen: {
    flex: 1,
    backgroundColor: colors.ivory,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },

  successCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },

  successTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: typography.weightBold,
    textAlign: 'center',
  },

  successBody: {
    color: colors.inkMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});

export default function Index() {
  return (
    <GovWatchProvider>
      <GovWatchApp />
    </GovWatchProvider>
  );
}
