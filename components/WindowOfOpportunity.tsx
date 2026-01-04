import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, AlertCircle, Crown, Lock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { formatFriendlyDate, getDaysRemaining, getQuickDateOptions } from '@/utils/helpers';

type ActivePicker = 'start' | 'end' | null;

interface Props {
  windowStartDate?: string;
  windowEndDate?: string;
  onStartDateChange: (date: string | undefined) => void;
  onEndDateChange: (date: string | undefined) => void;
  isPro?: boolean;
  onUpgrade?: () => void;
}

export default function WindowOfOpportunity({
  windowStartDate,
  windowEndDate,
  onStartDateChange,
  onEndDateChange,
  isPro = true,
  onUpgrade,
}: Props) {
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);

  const quickOptions = getQuickDateOptions();
  
  const daysRemaining = windowEndDate ? getDaysRemaining(windowEndDate) : null;
  const isClosingSoon = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 2;
  const isOverdue = daysRemaining !== null && daysRemaining < 0;

  const handleQuickOption = (option: { startDate: string; endDate: string }) => {
    onStartDateChange(option.startDate);
    onEndDateChange(option.endDate);
  };

  const handleStartDateChange = (_: unknown, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setActivePicker(null);
    }
    if (selectedDate) {
      onStartDateChange(selectedDate.toISOString());
    }
  };

  const handleEndDateChange = (_: unknown, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setActivePicker(null);
    }
    if (selectedDate) {
      onEndDateChange(selectedDate.toISOString());
    }
  };

  const openStartPicker = () => {
    setActivePicker('start');
  };

  const openEndPicker = () => {
    setActivePicker('end');
  };

  const closePicker = () => {
    setActivePicker(null);
  };

  const clearDates = () => {
    onStartDateChange(undefined);
    onEndDateChange(undefined);
  };

  if (!isPro) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Window of Opportunity</Text>
            <View style={styles.proBadge}>
              <Crown size={12} color="#FFD700" />
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.lockedContainer}
          onPress={onUpgrade}
          activeOpacity={0.8}
        >
          <View style={styles.lockedContent}>
            <Lock size={24} color={Colors.textTertiary} />
            <Text style={styles.lockedTitle}>Set Smart Deadlines</Text>
            <Text style={styles.lockedDescription}>
              Track time-sensitive loops with start and end dates.
              Get notified when windows are closing.
            </Text>
            <View style={styles.unlockButton}>
              <Text style={styles.unlockButtonText}>Unlock Pro</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Window of Opportunity</Text>
        {(windowStartDate || windowEndDate) && (
          <TouchableOpacity onPress={clearDates} activeOpacity={0.7}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.quickOptions}>
        {quickOptions.map(option => (
          <TouchableOpacity
            key={option.label}
            style={styles.quickChip}
            onPress={() => handleQuickOption(option)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickChipText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.datePickersRow}>
        <View style={styles.datePickerContainer}>
          <Text style={styles.dateLabel}>Start Date</Text>
          <TouchableOpacity
            style={[
              styles.dateButton,
              activePicker === 'start' && styles.dateButtonActive,
            ]}
            onPress={openStartPicker}
            activeOpacity={0.7}
          >
            <Calendar size={16} color={activePicker === 'start' ? Colors.primary : Colors.textSecondary} />
            <Text style={[
              styles.dateText,
              activePicker === 'start' && styles.dateTextActive,
            ]}>
              {windowStartDate ? formatFriendlyDate(windowStartDate) : 'Select'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.datePickerContainer}>
          <Text style={styles.dateLabel}>End Date</Text>
          <TouchableOpacity
            style={[
              styles.dateButton,
              activePicker === 'end' && styles.dateButtonActive,
            ]}
            onPress={openEndPicker}
            activeOpacity={0.7}
          >
            <Calendar size={16} color={activePicker === 'end' ? Colors.primary : Colors.textSecondary} />
            <Text style={[
              styles.dateText,
              activePicker === 'end' && styles.dateTextActive,
            ]}>
              {windowEndDate ? formatFriendlyDate(windowEndDate) : 'Select'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {(isClosingSoon || isOverdue) && (
        <View style={[styles.nudgeBanner, isOverdue && styles.overdueNudge]}>
          <AlertCircle size={16} color={isOverdue ? Colors.error : Colors.warning} />
          <Text style={[styles.nudgeText, isOverdue && styles.overdueText]}>
            {isOverdue
              ? `Overdue by ${Math.abs(daysRemaining!)} day${Math.abs(daysRemaining!) !== 1 ? 's' : ''}`
              : `Closing ${daysRemaining === 0 ? 'today' : daysRemaining === 1 ? 'tomorrow' : `in ${daysRemaining} days`}!`}
          </Text>
        </View>
      )}

      {activePicker === 'start' && (
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select Start Date</Text>
            <TouchableOpacity onPress={closePicker} style={styles.doneButton}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={windowStartDate ? new Date(windowStartDate) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleStartDateChange}
            themeVariant="dark"
          />
        </View>
      )}

      {activePicker === 'end' && (
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Select End Date</Text>
            <TouchableOpacity onPress={closePicker} style={styles.doneButton}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={windowEndDate ? new Date(windowEndDate) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleEndDateChange}
            minimumDate={windowStartDate ? new Date(windowStartDate) : undefined}
            themeVariant="dark"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  clearButton: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  quickOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  quickChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  datePickersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  datePickerContainer: {
    flex: 1,
    gap: 6,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  dateText: {
    fontSize: 14,
    color: Colors.text,
    textTransform: 'capitalize' as const,
  },
  dateButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDim,
  },
  dateTextActive: {
    color: Colors.primary,
  },
  pickerContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    marginTop: 8,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  doneButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  nudgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  overdueNudge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  nudgeText: {
    fontSize: 13,
    color: Colors.warning,
    fontWeight: '500' as const,
  },
  overdueText: {
    color: Colors.error,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFD700',
    letterSpacing: 0.5,
  },
  lockedContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  lockedContent: {
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  lockedTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  lockedDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  unlockButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  unlockButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFD700',
  },
});
