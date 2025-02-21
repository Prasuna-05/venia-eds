/* eslint-disable no-plusplus */
import { createOptimizedPicture } from '../../scripts/aem.js';

function createCard(data) {
  const card = document.createElement('div');
  card.classList.add('dynamic-card');

  const imgUrl = data.image.includes('/page') ? data.image : '../../icons/facebook.svg';
  const img = createOptimizedPicture(imgUrl, data.title || 'Image', false, [{ width: '750' }]);

  const header = document.createElement('h3');
  header.textContent = data.title;

  const description = document.createElement('p');
  description.textContent = data.description || 'No description available';

  card.append(img, header, description);
  return card;
}

async function fetchJsonData(jsonURL) {
  const resp = await fetch(jsonURL);
  if (!resp.ok) throw new Error(`Failed to fetch JSON from ${jsonURL}`);
  return resp.json();
}

function createCarousel(data) {
  const visibleCards = 4;
  const totalSlides = Math.ceil(data.length / visibleCards);

  const carouselContainer = document.createElement('div');
  carouselContainer.classList.add('carousel-container');

  const trackWrapper = document.createElement('div');
  trackWrapper.classList.add('carousel-track-wrapper');

  const track = document.createElement('div');
  track.classList.add('carousel-track');

  trackWrapper.append(track);
  carouselContainer.append(trackWrapper);

  // Create cards and add to track
  const cardElements = data.map(createCard);
  track.append(...cardElements);

  // Pagination dots
  const dotsContainer = document.createElement('div');
  dotsContainer.classList.add('carousel-dots');

  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.classList.add('carousel-dot');
    if (i === 0) dot.classList.add('active'); // First dot active by default
    dot.dataset.index = i;

    // Dot click event - scroll to respective section
    dot.addEventListener('click', () => {
      trackWrapper.scrollTo({
        left: i * trackWrapper.clientWidth, // Move based on wrapper width
        behavior: 'smooth',
      });

      // Update active dot
      dotsContainer.querySelectorAll('.carousel-dot').forEach((d) => d.classList.remove('active'));
      dot.classList.add('active');
    });

    dotsContainer.appendChild(dot);
  }

  carouselContainer.appendChild(dotsContainer);

  return carouselContainer;
}

export default async function decorate(block) {
  const queryIndexLink = block.querySelector('a[href$=".json"]');
  if (!queryIndexLink) return;

  try {
    const jsonURL = queryIndexLink.href;
    const jsonData = await fetchJsonData(jsonURL);

    const carousel = createCarousel(jsonData.data);
    queryIndexLink.replaceWith(carousel);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error creating carousel: ${error.message}`);
  }
}
