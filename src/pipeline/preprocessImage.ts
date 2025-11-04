import * as ImageManipulator from 'expo-image-manipulator';

interface PreprocessOptions {
  maxWidth?: number;
}

export const preprocessImage = async (
  uri: string,
  options: PreprocessOptions = {},
): Promise<string> => {
  const { maxWidth = 1600 } = options;

  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: maxWidth,
          },
        },
      ],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
    );

    return result.uri;
  } catch (error) {
    console.warn('Failed to preprocess image', error);
    return uri;
  }
};
