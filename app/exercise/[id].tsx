import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { C } from "../../src/utils/colors";
import { EXERCISES } from "../../src/data";
import { TypeBadge, Card, Button } from "../../src/components/UI";

// ── Per-exercise benefit text ─────────────────────────────────────────────────
const BENEFITS: Record<string, string> = {
  ex_chin_tucks:
    "Repoziționează capul deasupra coloanei, reducând stresul pe vertebrele cervicale. Esențial pentru forward head posture — una dintre cele mai frecvente probleme posturale la persoanele care stau mult la birou.",
  ex_upper_trap_stretch:
    "Relaxează și alungește trapezul superior, mușchiul cel mai frecvent responsabil pentru tensiunea la baza gâtului și durerile de cap de tip tensional. Reduce compresia pe vertebrele C3–C5.",
  ex_wall_angels:
    "Activează simultan rotatorii externi ai umărului, romboidele și stabilizatorii scapulari, contracarând efectele posturii aplecate înainte (rounded shoulders). Unul dintre cele mai complete exerciții de corectare posturală.",
  ex_levator_stretch:
    "Elonghează levator scapulae — mușchiul responsabil cel mai des pentru rigiditatea cervicală și blocajul la rotația capului. Un stretch neglijat adesea, dar cu impact clinic semnificativ.",
  ex_doorway_chest:
    "Deschide pectoralele scurte care trag umerii înainte, permițând scapulelor să revină la poziție neutră. Combate direct efectele posturale ale muncii pe calculator.",
  ex_cat_cow:
    "Mobilizează întreaga coloană vertebrală în flexie și extensie, lubrifiind discurile intervertebrale. Îmbunătățește conștientizarea neutră a pelvisului și reduce rigiditatea lombară matinală.",
  ex_child_pose:
    "Decomprimă coloana lombară prin tracțiune ușoară, relaxează musculatura paravertebrală și deschide articulațiile facetare. Unul dintre cele mai eficiente exerciții de recuperare activă pentru low back pain.",
  ex_dead_bug:
    "Antrenează stabilizarea neutrală a coloanei lombare prin activarea profundă a core-ului (transvers abdominal + multifidus), fără a comprima discurile. Superior plank-ului clasic pentru probleme lombare.",
  ex_glute_bridge:
    "Activează lanțul posterior (fese + ischiogambieri) și stabilizatorii pelvini, corectând dezechilibrul anteroposterior al pelvisului. Esențial în anterior pelvic tilt și dureri lombare.",
  ex_clamshell:
    "Izolat și activează gluteul mediu — mușchiul critic pentru stabilitatea laterală a șoldului. Slăbiciunea lui este o cauză majoră a durerilor de genunchi, sold și lombalgiei funcționale.",
  ex_piriformis_stretch:
    "Eliberează piriformisul, un mușchi adânc fesier care, când este tensionat, poate comprima nervul sciatic și produce dureri de tip sciatic. Stretch-ul figura 4 este tehnica gold standard.",
  ex_figure4:
    "Varianta funcțională a piriformis stretch — targetează musculatura rotator externă a șoldului. Mai accesibilă decât varianta pe podea și poate fi executată și pe scaun.",
  ex_hamstring_stretch:
    "Alungește ischiogambierii, al căror scurtament cronic contribuie la anterior pelvic tilt, dureri lombare și restricție de mișcare. Stretch-ul activ este superior celui pasiv forțat.",
  ex_calf_stretch:
    "Adresează gastrocnemianul și solearul — mușchi frecvent scurtați care afectează biomecanica gleznei, a genunchiului și a posturii globale. Stretch-ul dublu (drept + îndoit) este esențial.",
};

// ── Per-exercise step-by-step instructions ────────────────────────────────────
const STEPS: Record<string, string[]> = {
  ex_chin_tucks: [
    "Stai drept pe un scaun sau în picioare, privind înainte. Umerii relaxați, bărbia paralelă cu podeaua.",
    "Fără să ridici bărbia în sus, împinge ușor capul înapoi orizontal — ca și cum ai face un 'dublu bărbie'. Mentonul se retrage, nu coboară.",
    "Simți un stretch ușor la baza craniului și în mușchii suboccipitali. Nu ar trebui să dea durere — doar elongare.",
    "Menține poziția retrasă 3–5 secunde, respirând normal. Senzația de 'greutate' in ceafă este normală.",
    "Revino la start fără să proiectezi capul înainte din inerție. Mișcarea trebuie să fie mică, controlată — 1–2 cm. Repetă 12–15 ori, 2–3 serii.",
  ],
  ex_upper_trap_stretch: [
    "Stai pe un scaun ferm. Cu mâna stângă, prinde marginea scaunului sub tine — acesta este ancora care menține umărul în jos.",
    "Înclină capul spre dreapta (urechea dreaptă spre umărul drept), fără să ridici umărul stâng. Mișcarea vine din gât, nu din trunchi.",
    "Cu mâna dreaptă, aplică o presiune ușoară pe partea superioară a capului pentru a adânci stretch-ul. Nu forța — greutatea mâinii este suficientă.",
    "Simți elongarea pe toată lungimea gâtului stâng, spre umăr. Respiră profund: la expirație te lași ușor mai adânc.",
    "Menține 30–40 secunde, fără să miști umărul ancorat. Repetă de cealaltă parte. 2–3 ori per parte.",
  ],
  ex_wall_angels: [
    "Stai cu spatele la perete, tălpile la 10–15 cm față de perete, genunchii ușor îndoiți. Apasă spatele, fesele și occipitalul (ceafa) de perete.",
    "Ridică brațele în formă de W — coatele la 90°, dosul mâinilor și coatele ating peretele. Bărbia paralelă cu podeaua, nu o ridica.",
    "Menținând contactul cu peretele (spate, coate, dosul mâinilor), glisează brațele lent în sus spre forma literei Y. Nu permite arcuirea spatelui lombar.",
    "Dacă nu poți menține dosul mâinilor pe perete — oprește-te acolo unde pierzi contactul. NU forța mai sus; limitarea este un semnal de lucru.",
    "Coboară lent înapoi la W. Simți contracția romboidelor și stabilizatorilor scapulari. 10 repetări lente, 2–3 serii. Calitatea > cantitatea.",
  ],
  ex_levator_stretch: [
    "Stai pe un scaun și prinde cu mâna dreaptă marginea scaunului (ancora). Aceasta menține umărul drept jos pe tot parcursul.",
    "Rotește capul 45° spre stânga — ca și cum ai privi diagonal spre podeaua din față-stânga ta.",
    "Din această poziție rotată, înclină ușor capul înainte-diagonal, cu bărbia coborând spre clavicula stângă. Mică mișcare — 10–15°.",
    "Cu mâna stângă, aplică o presiune ușoară pe occipital (ceafă) pentru a adânci stretch-ul. Simți un stretch profund la baza gâtului, lateral și la unghiul intern al scapulei drepte.",
    "Menține 30–40 secunde, respirând. Expirația adânceste stretch-ul. Repetă de cealaltă parte (schimbă ancora și direcția). 2 ori per parte.",
  ],
  ex_doorway_chest: [
    "Stai în ușă sau la colțul unui perete. Ridică brațul la 90° față de corp (cot la înălțimea umărului, antebraț vertical — forma literei L).",
    "Lipește cotul și antebrațul de tocul ușii sau perete. Umărul rămâne coborât, nu ridicat.",
    "Fă un pas mic înainte cu piciorul opus brațului întins. Simt pieptul deschizându-se și umărul trăgând înapoi.",
    "IMPORTANT: Ține trunchiul drept și activ — nu te arcui din lombar. Stretch-ul trebuie simțit în pectoral și umărul anterior, nu în spate.",
    "Menține 30–40 sec. Poți varia înălțimea brațului (mai sus = pectoral clavicular, mai jos = pectoral sternal) pentru stretch complet. 2–3 ori per parte.",
  ],
  ex_cat_cow: [
    "Pornești în patru labe: palmele direct sub umeri, genunchii direct sub șolduri. Spatele neutru — nu arcuit, nu rotunjit.",
    "CAT (Pisica): Expiră profund și arcuiește spatele spre tavan — bărbia spre piept, coada în jos, abdomenul tras în sus. Toate vertebrele intră în flexie.",
    "Menține Cat 2–3 secunde. Simți elongarea mușchilor paravertebrali și lărgirea articulațiilor vertebrale. Expiria completă intensifică flexia.",
    "COW (Vaca): Inspiră și lasă spatele să coboare — burta spre podea, capul și coada ridicată, omoplații apropiați. Extensia completă a coloanei.",
    "Menține Cow 2–3 secunde. Alternează Cat–Cow lent și continuu, 10–15 repetări. Sincronizează perfect cu respirația: expir = Cat, inspir = Cow.",
  ],
  ex_child_pose: [
    "Pornești în patru labe. Deschide genunchii la lățimea șoldurilor sau mai larg (varianta wide child's pose pentru mobilitate șold).",
    "Împinge fesele lent spre călcâie, menținând brațele extinse înainte pe podea. Fruntea atinge sau se apropie de podea.",
    "Relaxează complet umerii — lasă-i să cadă spre podea. Simți elongarea întregii regiuni dorsale și lombare.",
    "Respiră adânc și lent: la INSPIR simți cum spatele se lărgește lateral (expansiune costală posterioară). La EXPIR, te lași mai profund în poziție.",
    "Menține 1–2 minute. Nu este un exercițiu de forță — este de decompresie activă. Poți pune o pernă între fese și călcâie dacă nu ajungi complet jos.",
  ],
  ex_dead_bug: [
    "Stai pe spate pe o suprafață fermă. Ridică brațele vertical spre tavan, genunchii îndoiți la 90° cu tibiile paralele cu podeaua (table-top position).",
    "Activează core-ul: apasă zona lombară COMPLET spre podea — nu trebuie să existe spațiu între spate și podea. Menține pe tot parcursul exercițiului.",
    "Expiră lent (4–5 sec) și coboară SIMULTAN brațul drept deasupra capului spre podea și piciorul STÂNG spre podea — fără să atingi solul. Coboară doar atât cât spatele rămâne lipit de podea.",
    "Inspiră și revino la centru (table-top). Repetă cu brațul STÂNG și piciorul DREPT. Mișcarea este lentă și controlată — nu dinamică.",
    "GREȘEALA frecventă: arcuirea spatelui la coborârea membrelor. Dacă se întâmplă, reduce amplitudinea. 8–10 repetări per parte, 2–3 serii.",
  ],
  ex_glute_bridge: [
    "Stai pe spate, genunchii îndoiți la aproximativ 90°, tălpile pe podea la lățimea șoldurilor. Brațele pe lângă corp, palmele în jos.",
    "Activează core-ul și contractă fesele înainte de a ridica. Imaginati-va ca 'strangi o nuca' cu fesele.",
    "Împinge prin tălpi și ridică bazinul spre tavan, formând o linie dreaptă umăr–șold–genunchi. NU hiperestinde lombar.",
    "Menține 2–3 secunde în poziția superioară cu fesele contractate maximal. Respiră normal — nu reține respirația.",
    "Coboară vertebră cu vertebră: lombarul, apoi dorsalul, apoi fesele. Controlat, lent — nu cădere liberă. 12–15 repetări, 3 serii.",
  ],
  ex_clamshell: [
    "Stai pe o parte, genunchii îndoiți la aproximativ 45°, șoldurile una direct deasupra celeilalte. Capul sprijinit pe braț.",
    "Tălpile rămân LIPITE una de alta pe tot parcursul exercițiului. Asigură-te că bazinul nu se rotește înapoi la ridicare.",
    "Menținând tălpile lipite, ridică genunchiul de deasupra cât poți de sus — rotind din șold. Mișcarea vine exclusiv din articulația șoldului, nu din rotația bazinului.",
    "Menține 1–2 secunde în vârf. Simți contracția intensă în gluteul mediu (lateralul superior al fesei). Dacă nu simți acolo, bazinul se rotește.",
    "Coboară lent, controlat. 15–20 repetări per parte, 3 serii. Poți adăuga o bandă elastică deasupra genunchilor pentru progresie.",
  ],
  ex_piriformis_stretch: [
    "Stai pe spate cu ambii genunchi îndoiți, tălpile pe podea. Pune glezna piciorului DREPT pe coapsa piciorului STÂNG (lângă genunchi) — forma cifrei 4.",
    "Flexează activ glezna dreaptă (trage vârful piciorului drept spre tine). Aceasta protejează genunchiul drept pe toată durata stretch-ului.",
    "Ridică piciorul STÂNG de pe podea și trage coapsa stângă spre piept cu ambele mâini (sau cu o bandă). Simți stretch-ul adânc în fesa dreaptă.",
    "Menține 30–60 secunde, respirând profund. La expirație te lași ușor mai adânc. Nu forța — piriformisul este adânc și reacționează prost la stretch agresiv.",
    "Repetă de cealaltă parte. 2–3 ori per parte. Dacă simți amorțeală sau durere iradiată, reduce intensitatea.",
  ],
  ex_figure4: [
    "Stai pe un scaun sau pe podea. Încrucișează glezna dreaptă pe genunchiul stâng (figura 4). Flexează glezna dreaptă pentru a proteja genunchiul.",
    "Ține trunchiul drept și aplecă-te ușor înainte din șolduri (nu rotunjind spatele) — simți cum stretch-ul apare în fesa dreaptă.",
    "Alternativ pe podea: stai pe spate, ridică ambele picioare, și cu mâinile trage coapsa piciorului de jos spre tine.",
    "Menține 30–45 secunde per parte. Respiră constant — expirul adâncește stretch-ul fesier.",
    "Stretch-ul trebuie simțit EXCLUSIV în fesă (gluteus medius, piriformis). Dacă simți durere în genunchi, oprește-te imediat.",
  ],
  ex_hamstring_stretch: [
    "Stai pe spate pe o suprafață fermă. Îndoaie genunchiul STÂNG cu talpa pe podea — acesta menține stabilitatea lombară.",
    "Ridică piciorul DREPT extins. Ținând din spatele coapsei cu ambele mâini (sau cu un prosop/bandă în jurul labei piciorului), trage piciorul spre tine.",
    "Menține genunchiul drept cât mai extins posibil, dar nu forța extensia completă. Un unghi de 70–80° față de podea este suficient.",
    "Simți stretch-ul în tot spatele coapsei (hamstrings). Nu arcui spatele lombar — dacă se arcuiește, reduce amplitudinea.",
    "Menține 30–40 secunde, respirând. Repetă 2–3 ori per parte. Variante: stretch în picioare cu piciorul pe un scaun (mai practic în pauze de birou).",
  ],
  ex_calf_stretch: [
    "Stai în fața unui perete, cu palmele sprijinite pe perete. Fă un pas înapoi cu piciorul drept, călcâiul DREPT rămâne pe podea.",
    "GASTROCNEMIAN: Ține genunchiul drept complet extins (drept). Înclină-te ușor spre perete — simți stretch-ul puternic în vârful gambei. Menține 30 sec.",
    "SOLEAR (mai profund): Din aceeași poziție, îndoaie ușor genunchiul drept, menținând călcâiul pe podea. Stretch-ul se mută mai jos, spre gleznă. Menține 30 sec.",
    "Totalul: 30 sec gastrocnemian + 30 sec solear = 1 minut per picior. Fă 2–3 serii per picior.",
    "Regula de aur: CĂLCÂIUL RĂMÂNE TOT TIMPUL PE PODEA. Ridicarea călcâiului anulează complet stretch-ul. Dacă nu poți, apropie piciorul de perete.",
  ],
  default: [
    "Pregătește un spațiu liber și confortabil, fără obstacole în jur.",
    "Execută mișcarea lent și controlat — nu în viteză. Controlul > amplitudinea.",
    "Menține poziția conform duratei indicate, respirând uniform și profund.",
    "La expirație, lasă-te ușor mai adânc în poziție (pentru stretch) sau menține contracția (pentru exerciții de activare).",
    "Repetă de 2–3 ori pentru rezultate optime. Dacă simți durere ascuțită, oprește-te imediat.",
  ],
};

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [started, setStarted] = useState(false);

  const exercise = EXERCISES.find((e) => e.id === id);
  if (!exercise) {
    return (
      <View style={styles.root}>
        <Text style={{ color: C.text, padding: 24 }}>Exercițiu negăsit.</Text>
      </View>
    );
  }

  const steps = STEPS[id] ?? STEPS.default;
  const benefit = BENEFITS[id];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll}>
      {/* ── Header card ─────────────────────────────────── */}
      <Card style={styles.headerCard}>
        <View style={styles.iconWrap}>
          <Text style={{ fontSize: 40 }}>{exercise.icon}</Text>
        </View>
        <Text style={styles.title}>{exercise.name}</Text>
        <View style={styles.badgeRow}>
          <TypeBadge type={exercise.type} />
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>⏱ {exercise.duration}</Text>
          </View>
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>{exercise.level}</Text>
          </View>
        </View>

        {/* ── Benefit text ── */}
        {!!benefit && (
          <View style={styles.benefitBox}>
            <Text style={styles.benefitLabel}>De ce funcționează</Text>
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        )}
      </Card>

      {/* ── Steps ───────────────────────────────────────── */}
      {!started ? (
        <Button
          label="▶  Începe exercițiul"
          onPress={() => setStarted(true)}
        />
      ) : (
        <Card>
          {/* Progress bar */}
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            Pas {currentStep + 1} din {steps.length}
          </Text>

          {/* Current step */}
          <View style={styles.stepBox}>
            <Text style={styles.stepNum}>{currentStep + 1}</Text>
            <Text style={styles.stepText}>{steps[currentStep]}</Text>
          </View>

          {/* Navigation */}
          <View style={styles.navRow}>
            <TouchableOpacity
              disabled={currentStep === 0}
              onPress={() => setCurrentStep((s) => s - 1)}
              style={[styles.navBtn, currentStep === 0 && { opacity: 0.3 }]}
            >
              <Text style={styles.navBtnText}>← Înapoi</Text>
            </TouchableOpacity>

            {currentStep < steps.length - 1 ? (
              <TouchableOpacity
                onPress={() => setCurrentStep((s) => s + 1)}
                style={[styles.navBtn, styles.navBtnPrimary]}
              >
                <Text style={[styles.navBtnText, { color: "#fff" }]}>
                  Înainte →
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.back()}
                style={[styles.navBtn, { backgroundColor: C.green }]}
              >
                <Text style={[styles.navBtnText, { color: "#fff" }]}>
                  ✅ Finalizat!
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      )}

      {/* ── All steps preview ───────────────────────────── */}
      <Card>
        <Text style={styles.cardTitle}>Toți pașii</Text>
        {steps.map((s, i) => (
          <View
            key={i}
            style={[
              styles.allStepRow,
              i < steps.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border },
            ]}
          >
            <View
              style={[
                styles.allStepNum,
                started && i <= currentStep && { backgroundColor: C.accent },
              ]}
            >
              <Text style={styles.allStepNumText}>{i + 1}</Text>
            </View>
            <Text style={[styles.allStepText, started && i < currentStep && { opacity: 0.4 }]}>
              {s}
            </Text>
          </View>
        ))}
      </Card>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: C.bg },
  scroll:{ padding: 16 },

  headerCard: { alignItems: "center", marginBottom: 12 },
  iconWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: C.accent + "22",
    justifyContent: "center", alignItems: "center", marginBottom: 10,
  },
  title:    { fontSize: 18, fontWeight: "800", color: C.text, textAlign: "center", marginBottom: 10 },
  badgeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 12 },
  metaChip: {
    backgroundColor: C.surface, borderRadius: 99,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: C.border,
  },
  metaText: { fontSize: 10, color: C.textMuted },

  benefitBox: {
    width: "100%",
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: C.accent,
    marginTop: 4,
  },
  benefitLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: C.accent,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  benefitText: {
    fontSize: 12,
    color: C.textMuted,
    lineHeight: 19,
    textAlign: "left",
  },

  progressBg:   { height: 4, backgroundColor: C.border, borderRadius: 99, marginBottom: 8 },
  progressFill: { height: 4, backgroundColor: C.accent, borderRadius: 99 },
  progressLabel:{ fontSize: 11, color: C.textMuted, marginBottom: 14 },

  stepBox: {
    backgroundColor: C.surface, borderRadius: 14, padding: 16,
    flexDirection: "row", gap: 12, alignItems: "flex-start", marginBottom: 16,
    borderWidth: 1, borderColor: C.border,
  },
  stepNum: {
    fontSize: 24, fontWeight: "900", color: C.accent, width: 28,
  },
  stepText: { flex: 1, fontSize: 14, color: C.text, lineHeight: 22 },

  navRow:        { flexDirection: "row", gap: 10 },
  navBtn:        {
    flex: 1, borderRadius: 10, paddingVertical: 11,
    alignItems: "center", backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border,
  },
  navBtnPrimary: { backgroundColor: C.accent, borderColor: C.accent },
  navBtnText:    { fontSize: 13, fontWeight: "700", color: C.textMuted },

  cardTitle: { fontSize: 14, fontWeight: "700", color: C.text, marginBottom: 12 },
  allStepRow:{ flexDirection: "row", gap: 10, paddingVertical: 12, alignItems: "flex-start" },
  allStepNum:{
    width: 24, height: 24, borderRadius: 99,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    justifyContent: "center", alignItems: "center",
    flexShrink: 0, marginTop: 1,
  },
  allStepNumText:{ fontSize: 11, fontWeight: "700", color: C.textMuted },
  allStepText:   { flex: 1, fontSize: 13, color: C.textMuted, lineHeight: 20 },
});
