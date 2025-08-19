import type { MunsellColor, MixQuizQuestion, RelationQuizQuestion } from '../types';
import { ALL_COLORS, MUNSELL_COLORS, NEUTRAL_COLORS } from '../constants';

const hexToRgb = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (c: number) => c.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const interpolate = (start: number, end: number, ratio: number): number => {
  return Math.round(start * (1 - ratio) + end * ratio);
};

const areOpposites = (color1: MunsellColor, color2: MunsellColor): boolean => {
    const index1 = MUNSELL_COLORS.findIndex(c => c.code === color1.code);
    const index2 = MUNSELL_COLORS.findIndex(c => c.code === color2.code);

    if (index1 === -1 || index2 === -1) return false;

    const diff = Math.abs(index1 - index2);
    return diff === MUNSELL_COLORS.length / 2;
}


export const mixTwoColors = (color1: MunsellColor, color2: MunsellColor, ratio: number): MunsellColor => {
    if (color1.hex === color2.hex) return color1;

    const [r_c1, g_c1, b_c1] = hexToRgb(color1.hex);
    const [r_c2, g_c2, b_c2] = hexToRgb(color2.hex);
    
    // Handle mixing with White or Black
    const isColor1Neutral = NEUTRAL_COLORS.some(c => c.hex === color1.hex);
    const isColor2Neutral = NEUTRAL_COLORS.some(c => c.hex === color2.hex);

    if (isColor1Neutral || isColor2Neutral) {
        const newHex = rgbToHex(interpolate(r_c1, r_c2, ratio), interpolate(g_c1, g_c2, ratio), interpolate(b_c1, b_c2, ratio));
        
        let name = "새로운 색";
        // If one color is neutral and the other is not, name it based on that
        if (isColor1Neutral !== isColor2Neutral) {
            const baseColor = isColor1Neutral ? color2 : color1;
            const neutralColor = isColor1Neutral ? color1 : color2;

            if (neutralColor.code === 'W') name = `밝은 ${baseColor.name}`;
            if (neutralColor.code === 'Bk') name = `어두운 ${baseColor.name}`;
        }
        
        // Special case for mixing black and white
        if ((color1.code === 'W' && color2.code === 'Bk') || (color1.code === 'Bk' && color2.code === 'W')) {
            name = '회색';
        }

        return { code: '혼합색', name, hex: newHex };
    }

    // Handle mixing two chromatic colors
    const isOpposite = areOpposites(color1, color2);
    
    let startR = r_c1, startG = g_c1, startB = b_c1;
    let endR = r_c2, endG = g_c2, endB = b_c2;
    let mixRatio = ratio;

    // If they are opposites, the middle of the mix should be a muddy/neutral color
    if (isOpposite) {
        const [neutralR, neutralG, neutralB] = hexToRgb('#8D6E63'); // Muddy brown
        if (ratio <= 0.5) { // from color1 to neutral
            [endR, endG, endB] = [neutralR, neutralG, neutralB];
            mixRatio = ratio * 2;
        } else { // from neutral to color2
            [startR, startG, startB] = [neutralR, neutralG, neutralB];
            // endR, endG, endB are already color2's RGB.
            mixRatio = (ratio - 0.5) * 2;
        }
    }
    
    const newHex = rgbToHex(interpolate(startR, endR, mixRatio), interpolate(startG, endG, mixRatio), interpolate(startB, endB, mixRatio));

    return {
        code: '혼합색',
        name: '새로운 색',
        hex: newHex,
    };
};

export const generateMixQuestion = (): MixQuizQuestion | null => {
    const pairs: [[MunsellColor, MunsellColor], MunsellColor][] = [];
    // Only use Munsell and Neutral colors for quiz source
    const quizSourceColors = [...MUNSELL_COLORS, ...NEUTRAL_COLORS];
    for (let i = 0; i < quizSourceColors.length; i++) {
        for (let j = i + 1; j < quizSourceColors.length; j++) {
            const color1 = quizSourceColors[i];
            const color2 = quizSourceColors[j];
            // Only mixable pairs that aren't the same
            if(color1.code !== color2.code){
                 const result = mixTwoColors(color1, color2, 0.5);
                 pairs.push([[color1, color2], result]);
            }
        }
    }
    if (pairs.length === 0) return null;

    const correctPairIndex = Math.floor(Math.random() * pairs.length);
    const [correctAnswer, targetColor] = pairs[correctPairIndex];

    const wrongAnswers: [MunsellColor, MunsellColor][] = [];
    while (wrongAnswers.length < 3) {
        const idx1 = Math.floor(Math.random() * quizSourceColors.length);
        let idx2 = Math.floor(Math.random() * quizSourceColors.length);
        while (idx1 === idx2) {
            idx2 = Math.floor(Math.random() * quizSourceColors.length);
        }
        const pair: [MunsellColor, MunsellColor] = [quizSourceColors[idx1], quizSourceColors[idx2]];

        const isCorrect = (pair[0].hex === correctAnswer[0].hex && pair[1].hex === correctAnswer[1].hex) || (pair[0].hex === correctAnswer[1].hex && pair[1].hex === correctAnswer[0].hex);
        const isDuplicate = wrongAnswers.some(wp => (wp[0].hex === pair[0].hex && wp[1].hex === pair[1].hex) || (wp[0].hex === pair[1].hex && wp[1].hex === pair[0].hex));
        
        if (!isCorrect && !isDuplicate) {
            wrongAnswers.push(pair);
        }
    }
    
    const options = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);

    return { type: 'MIX', targetColor, options, correctAnswer };
}

export const generateRelationQuestion = (): RelationQuizQuestion => {
    const relationType = Math.random() < 0.5 ? 'SIMILAR' : 'OPPOSITE';
    const targetIndex = Math.floor(Math.random() * MUNSELL_COLORS.length);
    const targetColor = MUNSELL_COLORS[targetIndex];

    let correctAnswers: MunsellColor[] = [];
    if (relationType === 'SIMILAR') {
        correctAnswers = [
            MUNSELL_COLORS[(targetIndex - 1 + MUNSELL_COLORS.length) % MUNSELL_COLORS.length],
            MUNSELL_COLORS[(targetIndex + 1) % MUNSELL_COLORS.length]
        ];
    } else { // OPPOSITE
        correctAnswers = [MUNSELL_COLORS[(targetIndex + MUNSELL_COLORS.length / 2) % MUNSELL_COLORS.length]];
    }

    const correctHexes = correctAnswers.map(c => c.hex);
    const wrongAnswers: MunsellColor[] = [];
    while(wrongAnswers.length < 3) {
        const randomColor = MUNSELL_COLORS[Math.floor(Math.random() * MUNSELL_COLORS.length)];
        if (randomColor.hex !== targetColor.hex && !correctHexes.includes(randomColor.hex) && !wrongAnswers.some(c => c.hex === randomColor.hex)) {
            wrongAnswers.push(randomColor);
        }
    }

    const options = [...wrongAnswers, ...correctAnswers].sort(() => Math.random() - 0.5);

    return { type: 'RELATION', relationType, targetColor, options, correctAnswers };
}