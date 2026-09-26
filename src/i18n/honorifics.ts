export interface HonorificRules {
  generalSuffix: string;
  femaleElder: string;
  maleElder: string;
  formalShri: string;
  formalSmt: string;
  respectfulPronoun: string;
  familiarPronoun: string;
}

export const HONORIFICS_REGISTRY: Record<string, HonorificRules> = {
  hi: {
    generalSuffix: 'जी',
    femaleElder: 'दीदी',
    maleElder: 'भैया',
    formalShri: 'श्री',
    formalSmt: 'श्रीमती',
    respectfulPronoun: 'आप',
    familiarPronoun: 'तुम',
  },
  bn: {
    generalSuffix: 'জি',
    femaleElder: 'দিদি',
    maleElder: 'দাদা',
    formalShri: 'শ্রী',
    formalSmt: 'শ্রীমতী',
    respectfulPronoun: 'আপনি',
    familiarPronoun: 'তুমি',
  },
  ta: {
    generalSuffix: 'அவர்கள்',
    femaleElder: 'அம்மா',
    maleElder: 'அண்ணா',
    formalShri: 'திரு',
    formalSmt: 'திருமதி',
    respectfulPronoun: 'நீங்கள்',
    familiarPronoun: 'நீ',
  },
  te: {
    generalSuffix: 'గారు',
    femaleElder: 'అక్క',
    maleElder: 'అన్న',
    formalShri: 'శ్రీ',
    formalSmt: 'శ్రీమతి',
    respectfulPronoun: 'మీరు',
    familiarPronoun: 'నువ్వు',
  },
  mr: {
    generalSuffix: 'जी / ताई / भाऊ',
    femaleElder: 'ताई',
    maleElder: 'दादा / भाऊ',
    formalShri: 'श्री',
    formalSmt: 'श्रीमती',
    respectfulPronoun: 'तुम्ही / आपण',
    familiarPronoun: 'तू',
  },
  en: {
    generalSuffix: 'ji',
    femaleElder: 'didi',
    maleElder: 'bhaiya',
    formalShri: 'Mr.',
    formalSmt: 'Mrs.',
    respectfulPronoun: 'you',
    familiarPronoun: 'you',
  },
};

export function getHonorificAddress(name: string, lang = 'hi', role: 'general' | 'female' | 'male' = 'general'): string {
  const rules = HONORIFICS_REGISTRY[lang] || HONORIFICS_REGISTRY.en;
  if (!name || name.trim() === '') {
    return role === 'female' ? rules.femaleElder : role === 'male' ? rules.maleElder : rules.generalSuffix;
  }
  return `${name} ${rules.generalSuffix}`;
}
