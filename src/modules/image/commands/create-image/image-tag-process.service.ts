import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import * as tf from '@tensorflow/tfjs-node';
import * as mobilenet from '@tensorflow-models/mobilenet';
import {
  TRANSLATE_GENERATOR,
  TranslateGenerator,
} from '@modules/translate/translate.module';
import { MobileNet } from '@tensorflow-models/mobilenet';

@Injectable()
export class ImageTagProcessService implements OnModuleInit {
  constructor(
    @Inject(TRANSLATE_GENERATOR)
    protected readonly translateGenerator: TranslateGenerator,
  ) {}
  private model: MobileNet;

  // 모듈 초기화 시 모델 로딩
  async onModuleInit(): Promise<void> {
    this.model = await mobilenet.load();
    console.log('TensorFlow Mobilenet Model loaded');
  }

  // 모델을 사용하여 이미지를 분류하는 메소드
  async classifyImage(buffer: Buffer): Promise<string[]> {
    const imageTensor = tf.node.decodeImage(buffer, 3);
    const predictions = await this.model.classify(imageTensor as tf.Tensor3D);
    imageTensor.dispose();
    const relevantTags = predictions
      .filter((p: { probability: number }) => p.probability >= 0.4)
      .map((p: { className: string }) => p.className);
    const koreanTags: string[] = [];
    for (const relevantTag of relevantTags) {
      const koreanTag = await this.translateGenerator.gcpTranslate(relevantTag);
      koreanTags.push(koreanTag);
    }
    return koreanTags;
  }
}
