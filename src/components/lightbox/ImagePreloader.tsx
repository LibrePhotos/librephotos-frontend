import { useEffect, useRef } from "react";
import { serverAddress } from "../../api_client/apiClient";

type ImagePreloaderProps = {
  prevSrc: string | null;
  mainSrc: string;
  nextSrc: string | null;
};

export function ImagePreloader({ prevSrc, mainSrc, nextSrc }: ImagePreloaderProps) {
  // Keep track of preloaded images for cleanup
  const preloadedImagesRef = useRef<Set<HTMLImageElement>>(new Set());

  // Preload images to ensure smoother swiping
  useEffect(() => {
    // Clean up previous preloaded images to prevent memory leaks
    preloadedImagesRef.current.forEach(image => {
      // eslint-disable-next-line no-param-reassign
      image.src = ""; // Clear the src to allow garbage collection
      image.remove();
    });
    preloadedImagesRef.current.clear();

    // Preload main image thumbnails for big view and square thumbnails
    const preloadThumbnail = (id: string | null) => {
      if (!id) return;

      // Preload big thumbnail for lightbox
      const bigImg = new Image();
      bigImg.src = `${serverAddress}/media/thumbnails_big/${id}`;
      preloadedImagesRef.current.add(bigImg);

      // Preload square thumbnail for preview
      const squareImg = new Image();
      squareImg.src = `${serverAddress}/media/square_thumbnails/${id}`;
      preloadedImagesRef.current.add(squareImg);
    };

    // Preload previous, main, and next thumbnails
    preloadThumbnail(prevSrc);
    preloadThumbnail(mainSrc);
    preloadThumbnail(nextSrc);

    // Cleanup function to clear images when component unmounts or deps change
    return () => {
      preloadedImagesRef.current.forEach(image => {
        // eslint-disable-next-line no-param-reassign
        image.src = ""; // Clear the src to allow garbage collection
        image.remove();
      });
      preloadedImagesRef.current.clear();
    };
  }, [prevSrc, mainSrc, nextSrc]);

  return null;
}
