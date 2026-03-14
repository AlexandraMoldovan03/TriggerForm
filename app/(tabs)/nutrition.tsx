import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const SPORTS = [
  { label: 'Running', emoji: '🏃' },
  { label: 'Cycling', emoji: '🚴' },
  { label: 'Swimming', emoji: '🏊' },
  { label: 'Football', emoji: '⚽' },
  { label: 'Gym', emoji: '🏋️' },
  { label: 'Basketball', emoji: '🏀' },
  { label: 'Tennis', emoji: '🎾' },
  { label: 'Rest / Yoga', emoji: '🧘' },
];

type AIResult = {
  summary: string;
  status: 'good' | 'needs_improvement' | 'poor';
  nutrients: { label: string; value: string }[];
  meals: { title: string; description: string; timing: string }[];
  tip: string;
};

export default function NutritionScreen() {
  const [step, setStep] = useState(1);
  const [sport, setSport] = useState('');
  const [intensity, setIntensity] = useState('Moderate');
  const [duration, setDuration] = useState(60);

  const [foodInput, setFoodInput] = useState('');
  const [foods, setFoods] = useState<string[]>([]);
  const [mealImage, setMealImage] = useState<string | null>(null);

  const [water, setWater] = useState(1.5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
const keyPreview = GEMINI_KEY ? GEMINI_KEY.slice(0, 10) : 'undefined';
  const addFood = () => {
    if (!foodInput.trim()) return;
    setFoods([...foods, foodInput.trim()]);
    setFoodInput('');
  };

  const removeFood = (index: number) => {
    setFoods(foods.filter((_, idx) => idx !== index));
  };

  const pickMealImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setMealImage(result.assets[0].uri);
    }
  };

  const runAI = async () => {
  if (!GEMINI_KEY) {
    Alert.alert(
      'Missing API key',
      'Add EXPO_PUBLIC_GEMINI_API_KEY in your .env file and restart Expo.'
    );
    return;
  }

  setLoading(true);

  const prompt = `
You are a sports nutrition coach.
Analyze this athlete's recovery needs.

Athlete info:
- Sport: ${sport}
- Intensity: ${intensity}
- Duration: ${duration} minutes
- Water: ${water}L
- Foods eaten today: ${foods.join(', ') || 'nothing logged'}
- Meal photo uploaded: ${mealImage ? 'yes' : 'no'}

Return ONLY valid JSON in this exact shape:
{
  "summary": "2-3 short sentences",
  "status": "good",
  "nutrients": [
    {"label":"Protein","value":"..."},
    {"label":"Carbs","value":"..."},
    {"label":"Hydration","value":"..."},
    {"label":"Electrolytes","value":"..."}
  ],
  "meals": [
    {"title":"...","description":"...","timing":"..."},
    {"title":"...","description":"...","timing":"..."},
    {"title":"...","description":"...","timing":"..."}
  ],
  "tip": "one short recovery tip"
}

Allowed values for status:
- "good"
- "needs_improvement"
- "poor"
`;

  try {
   const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  }
);

    const data = await response.json();

    console.log('GEMINI RAW RESPONSE:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      Alert.alert(
        'API error',
        data?.error?.message || 'Gemini returned an error.'
      );
      return;
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      Alert.alert('AI error', 'Gemini returned an empty response.');
      return;
    }

    const parsed = JSON.parse(text);

    setResult(parsed);
    setStep(3);
  } catch (error: any) {
    console.log('RUN AI ERROR:', error);
    Alert.alert(
      'Error',
      error?.message || 'Could not analyze nutrition.'
    );
  } finally {
    setLoading(false);
  }
};

  const reset = () => {
    setSport('');
    setIntensity('Moderate');
    setDuration(60);
    setFoodInput('');
    setFoods([]);
    setMealImage(null);
    setWater(1.5);
    setResult(null);
    setStep(1);
  };

  const statusColor = (status: string) => {
    if (status === 'good') return '#1fd67a';
    if (status === 'needs_improvement') return '#f59e0b';
    return '#ef4444';
  };

  return (
    <View style={st.container}>
      <View style={st.header}>
        <Text style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>
  KEY: {keyPreview}
</Text>
        <Text style={st.headerTitle}>Nutrition Coach</Text>
        <View style={st.progTrack}>
          <View
            style={[
              st.progFill,
              {
                width: step === 1 ? '33%' : step === 2 ? '66%' : '100%',
              },
            ]}
          />
        </View>
      </View>

      {step === 1 && (
        <ScrollView contentContainerStyle={st.content}>
          <Text style={st.stepTitle}>What did you train today?</Text>
          <Text style={st.stepSub}>Pick your sport, intensity, and duration.</Text>

          <View style={st.sportGrid}>
            {SPORTS.map((sp) => (
              <TouchableOpacity
                key={sp.label}
                style={[st.sportChip, sport === sp.label && st.chipSel]}
                onPress={() => setSport(sp.label)}>
                <Text style={st.sportEmoji}>{sp.emoji}</Text>
                <Text style={[st.sportName, sport === sp.label && st.nameSel]}>
                  {sp.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={st.label}>Intensity</Text>
          <View style={st.row}>
            {['Light', 'Moderate', 'Intense'].map((i) => (
              <TouchableOpacity
                key={i}
                style={[st.intBtn, intensity === i && st.chipSel]}
                onPress={() => setIntensity(i)}>
                <Text style={[st.intTxt, intensity === i && st.nameSel]}>{i}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={st.label}>Duration: {duration} min</Text>
          <View style={st.row}>
            {[15, 30, 45, 60, 90, 120].map((d) => (
              <TouchableOpacity
                key={d}
                style={[st.durBtn, duration === d && st.chipSel]}
                onPress={() => setDuration(d)}>
                <Text style={[st.durTxt, duration === d && st.nameSel]}>{d}m</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[st.nextBtn, !sport && st.btnDisabled]}
            onPress={() => sport && setStep(2)}>
            <Text style={st.nextTxt}>Continue →</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 2 && (
        <ScrollView contentContainerStyle={st.content}>
          <Text style={st.stepTitle}>What have you eaten?</Text>
          <Text style={st.stepSub}>Add every meal and snack today.</Text>

          <TouchableOpacity style={st.photoBtn} onPress={pickMealImage}>
            <Text style={st.photoBtnText}>
              {mealImage ? 'Change meal photo' : 'Add meal photo'}
            </Text>
          </TouchableOpacity>

          {mealImage && <Image source={{ uri: mealImage }} style={st.mealPreview} />}

          <View style={st.foodRow}>
            <TextInput
              style={st.foodInput}
              placeholder="e.g. chicken, rice, banana..."
              placeholderTextColor="#6b7280"
              value={foodInput}
              onChangeText={setFoodInput}
              onSubmitEditing={addFood}
            />
            <TouchableOpacity style={st.addBtn} onPress={addFood}>
              <Text style={st.addTxt}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={st.tags}>
            {foods.map((f, i) => (
              <TouchableOpacity key={i} style={st.tag} onPress={() => removeFood(i)}>
                <Text style={st.tagTxt}>{f} ×</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={st.label}>Water today: {water.toFixed(1)}L</Text>
          <View style={st.row}>
            {[0.5, 1, 1.5, 2, 2.5, 3].map((w) => (
              <TouchableOpacity
                key={w}
                style={[st.durBtn, water === w && st.chipSel]}
                onPress={() => setWater(w)}>
                <Text style={[st.durTxt, water === w && st.nameSel]}>{w}L</Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View style={st.loadingBox}>
              <ActivityIndicator size="large" color="#1fd67a" />
              <Text style={st.loadingText}>Analyzing recovery...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[st.nextBtn, foods.length === 0 && !mealImage && st.btnDisabled]}
              onPress={() => (foods.length > 0 || mealImage) && runAI()}>
              <Text style={st.nextTxt}>Analyze my nutrition →</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {step === 3 && result && (
        <ScrollView contentContainerStyle={st.content}>
          <View style={[st.badge, { borderColor: statusColor(result.status) }]}>
            <Text style={[st.badgeTxt, { color: statusColor(result.status) }]}>
              {result.status === 'good'
                ? 'Recovery on track'
                : result.status === 'needs_improvement'
                ? 'Needs improvement'
                : 'Recovery at risk'}
            </Text>
          </View>

          <View style={st.card}>
            <Text style={st.cardTitle}>Assessment</Text>
            <Text style={st.cardTxt}>{result.summary}</Text>
          </View>

          <Text style={st.secTitle}>NUTRIENT NEEDS</Text>
          <View style={st.nutGrid}>
            {(result.nutrients || []).map((n, i) => (
              <View key={i} style={st.nutPill}>
                <Text style={st.nutLabel}>{n.label}</Text>
                <Text style={st.nutVal}>{n.value}</Text>
              </View>
            ))}
          </View>

          <Text style={st.secTitle}>RECOMMENDED MEALS</Text>
          {(result.meals || []).map((m, i) => (
            <View key={i} style={st.mealItem}>
              <Text style={st.mealTitle}>{m.title}</Text>
              <Text style={st.mealDesc}>{m.description}</Text>
              <Text style={st.mealTime}>⏰ {m.timing}</Text>
            </View>
          ))}

          {result.tip ? (
            <View style={st.tipBox}>
              <Text style={st.tipTxt}>💡 {result.tip}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={st.resetBtn} onPress={reset}>
            <Text style={st.resetTxt}>← Start over</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    padding: 16,
    paddingTop: 56,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },
  progTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 99,
  },
  progFill: {
    height: 3,
    backgroundColor: '#1fd67a',
    borderRadius: 99,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  stepSub: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9ca3af',
    marginBottom: 8,
  },
  sportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  sportChip: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  chipSel: {
    backgroundColor: 'rgba(31,214,122,0.1)',
    borderColor: '#1fd67a',
  },
  sportEmoji: {
    fontSize: 22,
    marginBottom: 5,
  },
  sportName: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  nameSel: {
    color: '#1fd67a',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  intBtn: {
    flex: 1,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 10,
    alignItems: 'center',
  },
  intTxt: {
    fontSize: 13,
    color: '#9ca3af',
  },
  durBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 10,
  },
  durTxt: {
    fontSize: 13,
    color: '#9ca3af',
  },
  nextBtn: {
    backgroundColor: '#1fd67a',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  nextTxt: {
    fontSize: 15,
    fontWeight: '700',
    color: '#052d14',
  },
  foodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  foodInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 11,
    fontSize: 14,
    color: '#e5e7eb',
  },
  addBtn: {
    backgroundColor: '#1fd67a',
    borderRadius: 10,
    padding: 11,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addTxt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#052d14',
  },
  photoBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  photoBtnText: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
  },
  mealPreview: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    marginBottom: 14,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 14,
  },
  tag: {
    backgroundColor: 'rgba(31,214,122,0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(31,214,122,0.25)',
    borderRadius: 99,
    paddingVertical: 5,
    paddingHorizontal: 11,
  },
  tagTxt: {
    fontSize: 12,
    color: '#1fd67a',
  },
  loadingBox: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#6b7280',
    marginTop: 10,
  },
  badge: {
    borderWidth: 0.5,
    borderRadius: 99,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  badgeTxt: {
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#e5e7eb',
    marginBottom: 6,
  },
  cardTxt: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 20,
  },
  secTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 1,
    marginBottom: 9,
  },
  nutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  nutPill: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    padding: 10,
  },
  nutLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  nutVal: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e5e7eb',
  },
  mealItem: {
    borderLeftWidth: 2,
    borderLeftColor: '#1fd67a',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    marginBottom: 8,
  },
  mealTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e5e7eb',
    marginBottom: 4,
  },
  mealDesc: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 18,
  },
  mealTime: {
    fontSize: 11,
    color: '#1fd67a',
    marginTop: 5,
    fontWeight: '600',
  },
  tipBox: {
    backgroundColor: 'rgba(31,214,122,0.07)',
    borderWidth: 0.5,
    borderColor: 'rgba(31,214,122,0.2)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  tipTxt: {
    fontSize: 13,
    color: '#86efac',
    lineHeight: 20,
  },
  resetBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 13,
    alignItems: 'center',
    marginTop: 8,
  },
  resetTxt: {
    fontSize: 14,
    color: '#e5e7eb',
  },
});