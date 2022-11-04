export default class Carousel {
  #carousel;
  #imageContainer;
  #images;
  #index;
  #transitioning;
  #navItem;
  #navCurrent;
  #navItems;
  #navCurrentItem;
  #timeoutId;
  #delay;

  constructor(carousel, images, {
    imageContainer, leftArrow, rightArrow, nav, navItem, navCurrent, delay,
  } = {}) {
    this.#carousel = carousel;
    this.#images = images;
    this.#imageContainer = carousel.querySelector(`.${imageContainer || 'image-container'}`);
    this.#navItem = navItem;
    this.#navCurrent = navCurrent;
    this.#index = 0;
    this.#transitioning = false;
    this.#delay = delay ?? 5000;
    this.#setImages();
    this.#setArrowClickEvents(carousel.querySelector(`.${leftArrow || 'left-arrow'}`));
    this.#setArrowClickEvents(carousel.querySelector(`.${rightArrow || 'right-arrow'}`), true);
    this.#setNavigation(carousel.querySelector(`.${nav || 'nav'}`));
    this.#setTransitioningEvents();
    this.#setTransitionTimeout();
  }

  #setImages() {
    this.#images.forEach((image) => {
      this.#addImage(image);
    });
  }

  #addImage(source) {
    const image = document.createElement('img');
    image.src = source;
    this.#imageContainer.appendChild(image);
  }

  #setArrowClickEvents(arrow, forward = false) {
    arrow.addEventListener('click', () => {
      if (this.#transitioning) return;

      if (forward) {
        this.next();
        return;
      }

      this.prev();
    });
  }

  #setNavigation(nav) {
    let currentGiven = false;
    this.#navItems = [];

    // eslint-disable-next-line no-unused-vars
    this.#images.forEach((image, index) => {
      const item = this.#createNavItem(this.#navItem);

      if (!currentGiven) {
        item.className = this.#navCurrent;
        this.#navCurrentItem = item;
        currentGiven = true;
      }

      this.#setNavItemClickEvents(item, index);
      this.#navItems.push(item);
      nav.appendChild(item);
    });
  }

  #createNavItem(className) {
    const item = document.createElement('li');
    item.className = className;
    return item;
  }

  #setNavItemClickEvents(navItem, index) {
    navItem.addEventListener('click', () => {
      if (this.#navCurrentItem === this.#navItems[index]) return;

      this.#index = index;
      this.#transition();
    });
  }

  #setTransitioningEvents() {
    this.#imageContainer.addEventListener('transitionstart', () => {
      this.#clearTransitionTimeout();
      this.#transitioning = true;
    });

    this.#imageContainer.addEventListener('transitionend', () => {
      this.#transitioning = false;
      this.#setTransitionTimeout();
    });
  }

  #setTransitionTimeout() {
    this.#timeoutId = setTimeout(() => this.next(), this.#delay);
  }

  #clearTransitionTimeout() {
    clearTimeout(this.#timeoutId);
  }

  next() {
    this.#index++;
    if (this.#index === this.#images.length) this.#index = 0;
    this.#transition();
  }

  prev() {
    this.#index--;
    if (this.#index < 0) this.#index = this.#images.length - 1;
    this.#transition();
  }

  #transition() {
    if (this.#transitioning) return;

    this.#navCurrentItem.className = this.#navItem;
    this.#navItems[this.#index].className = this.#navCurrent;
    this.#navCurrentItem = this.#navItems[this.#index];

    let translateTo = 0;
    if (this.#index) translateTo = 100 * this.#index;
    this.#imageContainer.style.transform = `translateX(-${translateTo}%)`;
  }
}
