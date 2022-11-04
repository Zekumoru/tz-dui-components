export default class CollapsibleMenu {
  menu;
  menuItems;
  moreItem;
  onResize;
  onSelect;
  #collapsedItems;
  #onResize;
  #dropdownClassName;
  #dropdownMenu;
  #allFit;

  constructor(menu, {
    more, dropdown, onResize, onSelect,
  } = {}) {
    this.menu = menu;
    this.moreItem = menu.querySelector(`.${this.#getClassList(more)[0]}`);
    this.menuItems = menu.querySelector('ul').children;
    this.onResize = onResize;
    this.onSelect = onSelect;
    this.#dropdownClassName = dropdown;
    this.#setMenuItemsClickEvents();
    this.#setPrivateOnResize();
    this.#setResizeObserver();
  }

  #getClassList(string = '') {
    return string.split(' ').filter((s) => s);
  }

  #setMenuItemsClickEvents() {
    [...this.menuItems].forEach((menuItem) => {
      if (menuItem === this.moreItem) return;
      menuItem.addEventListener('click', () => this.#selectMenuItem(menuItem));
    });
  }

  #selectMenuItem(item) {
    if (typeof this.onSelect !== 'function') return;
    this.onSelect(item);
  }

  #setResizeObserver() {
    new ResizeObserver(() => {
      this.#collapsedItems = [];

      const { width, moreIndex } = this.#findWidthAndMoreIndex();
      this.#renderMenuItems(width, moreIndex);

      if (typeof this.#onResize === 'function') this.#onResize();
    }).observe(this.menu);
  }

  #setPrivateOnResize() {
    this.#onResize = () => {
      this.#setDropdownMenu();

      if (this.#allFit) {
        this.#dropdownMenu?.remove();
        this.#dropdownMenu = null;
        return;
      }

      // Populate dropdown items
      this.#dropdownMenu.innerHTML = '';
      this.#collapsedItems.forEach((item) => {
        const dropdownItem = document.createElement('li');
        dropdownItem.textContent = item.textContent;
        this.#dropdownMenu.appendChild(dropdownItem);
      });

      if (typeof this.onResize === 'function') this.onResize(this.moreItem, this.#dropdownMenu, this.#collapsedItems);
    };
  }

  #setDropdownMenu() {
    if (this.#allFit) return;
    if (this.#dropdownMenu) this.#dropdownMenu.remove();
    this.#dropdownMenu = document.createElement('ul');
    this.#dropdownMenu.className = this.#dropdownClassName ?? '';
    this.moreItem.appendChild(this.#dropdownMenu);
  }

  #findWidthAndMoreIndex() {
    let width = 0;
    let moreIndex = -1;
    this.moreItem.style.display = '';

    // Find the index where to insert 'More'
    for (let i = 0; i < this.menuItems.length; i++) {
      const menuItem = this.menuItems[i];
      if (menuItem === this.moreItem) continue;

      menuItem.style.display = '';
      menuItem.style.flex = 'initial';

      width += menuItem.offsetWidth;
      const widthWithMore = width + this.moreItem.offsetWidth;
      if (widthWithMore <= this.menu.offsetWidth) moreIndex = i;
      menuItem.style.flex = '';
    }

    return {
      width,
      moreIndex,
    };
  }

  #renderMenuItems(width, moreIndex) {
    this.#allFit = false;

    // If all list items can fit then do not render 'More'
    if (width <= this.menu.offsetWidth) {
      this.moreItem.style.display = 'none';
      this.#allFit = true;
      return;
    }

    // Render only fit items
    for (let i = 0; i <= moreIndex; i++) {
      const menuItem = this.menuItems[i];
      if (menuItem === this.moreItem) continue;
      menuItem.style.display = '';
    }
    for (let i = moreIndex + 1; i < this.menuItems.length; i++) {
      const menuItem = this.menuItems[i];
      if (menuItem === this.moreItem) continue;
      menuItem.style.display = 'none';
      this.#collapsedItems.push(menuItem);
    }
  }
}
