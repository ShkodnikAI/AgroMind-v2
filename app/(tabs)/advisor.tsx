/**
 * AI Advisor Screen — AI советник для садоводов
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAlert } from '@/template';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AIResponseCard } from '../../components/features/AIResponseCard';
import { getAgroAdvice, calculateFertilizer, detectPest } from '../../services/ai';
import { theme } from '../../constants/theme';

type AdviceType = 'general' | 'watering' | 'fertilizing' | 'pests' | 'pruning';
type SoilType = 'default' | 'sandy-soil' | 'clay-soil';

export default function AdvisorScreen() {
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<'advice' | 'fertilizer' | 'pest'>('advice');
  
  // Advice tab
  const [plantName, setPlantName] = useState('');
  const [adviceType, setAdviceType] = useState<AdviceType>('general');
  
  // Fertilizer tab
  const [fertPlant, setFertPlant] = useState('');
  const [soilType, setSoilType] = useState<SoilType>('default');
  const [area, setArea] = useState('1');
  
  // Pest tab
  const [pestDescription, setPestDescription] = useState('');
  
  // Response
  const [response, setResponse] = useState<{ text: string; isFallback: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleGetAdvice = async () => {
    if (!plantName.trim()) {
      showAlert('Ошибка', 'Введите название растения');
      return;
    }
    
    setLoading(true);
    setResponse(null);
    
    try {
      const result = await getAgroAdvice(plantName.trim(), adviceType);
      setResponse(result);
    } catch (error: any) {
      showAlert('Ошибка', error.message || 'Не удалось получить совет');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCalculateFertilizer = async () => {
    if (!fertPlant.trim()) {
      showAlert('Ошибка', 'Введите название растения');
      return;
    }
    
    const areaNum = parseFloat(area) || 1;
    
    setLoading(true);
    setResponse(null);
    
    try {
      const result = await calculateFertilizer(fertPlant.trim(), soilType, areaNum);
      setResponse(result);
    } catch (error: any) {
      showAlert('Ошибка', error.message || 'Не удалось рассчитать дозу');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDetectPest = async () => {
    if (!pestDescription.trim()) {
      showAlert('Ошибка', 'Опишите симптомы поражения');
      return;
    }
    
    setLoading(true);
    setResponse(null);
    
    try {
      const result = await detectPest(pestDescription.trim());
      setResponse(result);
    } catch (error: any) {
      showAlert('Ошибка', error.message || 'Не удалось определить проблему');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRetry = () => {
    if (activeTab === 'advice') handleGetAdvice();
    else if (activeTab === 'fertilizer') handleCalculateFertilizer();
    else handleDetectPest();
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <MaterialIcons name="lightbulb" size={32} color={theme.colors.colorPrimary} />
            <Text style={styles.title}>AI Советник</Text>
          </View>
          
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'advice' && styles.tabActive]}
              onPress={() => setActiveTab('advice')}
            >
              <Text style={[styles.tabText, activeTab === 'advice' && styles.tabTextActive]}>
                Советы
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'fertilizer' && styles.tabActive]}
              onPress={() => setActiveTab('fertilizer')}
            >
              <Text style={[styles.tabText, activeTab === 'fertilizer' && styles.tabTextActive]}>
                Удобрения
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'pest' && styles.tabActive]}
              onPress={() => setActiveTab('pest')}
            >
              <Text style={[styles.tabText, activeTab === 'pest' && styles.tabTextActive]}>
                Вредители
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            {activeTab === 'advice' && (
              <>
                <Input
                  label="Название растения"
                  value={plantName}
                  onChangeText={setPlantName}
                  placeholder="Томат, яблоня, роза..."
                />
                
                <Text style={styles.label}>Тип совета</Text>
                <View style={styles.options}>
                  {(['general', 'watering', 'fertilizing', 'pests', 'pruning'] as AdviceType[]).map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.option, adviceType === type && styles.optionActive]}
                      onPress={() => setAdviceType(type)}
                    >
                      <Text style={[styles.optionText, adviceType === type && styles.optionTextActive]}>
                        {type === 'general' && 'Общий'}
                        {type === 'watering' && 'Полив'}
                        {type === 'fertilizing' && 'Подкормка'}
                        {type === 'pests' && 'Вредители'}
                        {type === 'pruning' && 'Обрезка'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Button
                  title="Получить совет"
                  onPress={handleGetAdvice}
                  loading={loading}
                  disabled={!plantName.trim()}
                />
              </>
            )}
            
            {activeTab === 'fertilizer' && (
              <>
                <Input
                  label="Название растения"
                  value={fertPlant}
                  onChangeText={setFertPlant}
                  placeholder="Томат, яблоня..."
                />
                
                <Text style={styles.label}>Тип почвы</Text>
                <View style={styles.options}>
                  {(['default', 'sandy-soil', 'clay-soil'] as SoilType[]).map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.option, soilType === type && styles.optionActive]}
                      onPress={() => setSoilType(type)}
                    >
                      <Text style={[styles.optionText, soilType === type && styles.optionTextActive]}>
                        {type === 'default' && 'Обычная'}
                        {type === 'sandy-soil' && 'Песчаная'}
                        {type === 'clay-soil' && 'Глинистая'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Input
                  label="Площадь (м²)"
                  value={area}
                  onChangeText={setArea}
                  placeholder="1"
                  keyboardType="numeric"
                />
                
                <Button
                  title="Рассчитать дозу"
                  onPress={handleCalculateFertilizer}
                  loading={loading}
                  disabled={!fertPlant.trim()}
                />
              </>
            )}
            
            {activeTab === 'pest' && (
              <>
                <Input
                  label="Опишите симптомы"
                  value={pestDescription}
                  onChangeText={setPestDescription}
                  placeholder="Бурые пятна на листьях, липкий налёт..."
                  multiline
                  numberOfLines={4}
                  style={styles.textarea}
                />
                
                <Button
                  title="Определить проблему"
                  onPress={handleDetectPest}
                  loading={loading}
                  disabled={!pestDescription.trim()}
                />
              </>
            )}
            
            {response && (
              <View style={styles.responseContainer}>
                <Text style={styles.responseTitle}>Результат</Text>
                <AIResponseCard
                  text={response.text}
                  isFallback={response.isFallback}
                  onRetry={response.isFallback ? handleRetry : undefined}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.colorBackground,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.colorText,
    marginLeft: theme.spacing.sm,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.colorSurfaceVariant,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: theme.colors.colorPrimary,
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.colorTextSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.colorText,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  option: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.colorSurfaceVariant,
  },
  optionActive: {
    backgroundColor: theme.colors.colorPrimary,
  },
  optionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.colorTextSecondary,
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.medium,
  },
  textarea: {
    height: 100,
    paddingTop: theme.spacing.sm,
    textAlignVertical: 'top',
  },
  responseContainer: {
    marginTop: theme.spacing.lg,
  },
  responseTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.colorText,
    marginBottom: theme.spacing.md,
  },
});
