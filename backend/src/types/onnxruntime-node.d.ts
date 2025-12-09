declare module 'onnxruntime-node' {
  import * as ort from 'onnxruntime'; // Assuming the underlying onnxruntime package exports InferenceSession
  export = ort; // Export ort, which includes InferenceSession
}
