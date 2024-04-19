import { Translate } from '@google-cloud/translate/build/src/v2';
import { Injectable, Module } from '@nestjs/common';

@Injectable()
export class TranslateGeneratorImplement implements TranslateGenerator {
  private gcp: Translate;

  constructor() {
    this.gcp = new Translate({
      projectId: process.env.GOOGLE_PROJECT_ID,
      key: process.env.GOOGLE_KEY,
    });
  }
  async gcpTranslate(word: string): Promise<string> {
    const [translations] = await this.gcp.translate(word, 'ko');
    return translations;
  }

  isEnglishText(text: string): boolean {
    return /^[A-Za-z]+$/.test(text);
  }

  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
}

export interface TranslateGenerator {
  gcpTranslate(word: string): Promise<string>;
  isEnglishText(word: string): boolean;
  capitalizeFirstLetter(word: string): string;
}

export const TRANSLATE_GENERATOR = 'TRANSLATE_GENERATOR';

@Module({
  providers: [
    {
      provide: TRANSLATE_GENERATOR,
      useClass: TranslateGeneratorImplement,
    },
  ],
  exports: [TRANSLATE_GENERATOR],
})
export class TranslateModule {}
