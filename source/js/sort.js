// 排序可视化基类
class SortingVisualizer {
  constructor(containerId, generateBtnId, sortBtnId) {
    this.array = [];
    this.arrayContainer = document.getElementById(containerId);
    this.generateBtn = document.getElementById(generateBtnId);
    this.sortBtn = document.getElementById(sortBtnId);
    this.isSorting = false;
    this.delay = 500; // 动画延迟时间（毫秒）

    this.generateBtn.addEventListener("click", () => this.generateArray());
    this.sortBtn.addEventListener("click", () => this.startSorting());

    // 初始化数组
    this.generateArray();
  }

  // 生成随机数组
  generateArray() {
    this.array = Array.from(
      { length: 10 },
      () => Math.floor(Math.random() * 100) + 1
    );
    this.renderArray();
  }

  // 渲染数组
  renderArray() {
    this.arrayContainer.innerHTML = "";
    const maxValue = Math.max(...this.array);

    this.array.forEach((value, index) => {
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.height = `${(value / maxValue) * 250}px`;

      const valueLabel = document.createElement("div");
      valueLabel.className = "bar-value";
      valueLabel.textContent = value;

      bar.appendChild(valueLabel);
      this.arrayContainer.appendChild(bar);
    });
  }

  // 更新柱状图状态
  updateBars(states) {
    const bars = this.arrayContainer.getElementsByClassName("bar");

    for (let i = 0; i < bars.length; i++) {
      bars[i].className = "bar";
      if (states.sorted && i < states.sorted) {
        bars[i].classList.add("sorted");
      }
      if (states.current && i === states.current) {
        bars[i].classList.add("current");
      }
      if (states.min && i === states.min) {
        bars[i].classList.add("min");
      }
      if (states.comparing && states.comparing.includes(i)) {
        bars[i].classList.add("comparing");
      }
    }
  }

  // 交换数组中的两个元素
  async swap(i, j) {
    const bars = this.arrayContainer.getElementsByClassName("bar");
    const temp = this.array[i];
    this.array[i] = this.array[j];
    this.array[j] = temp;

    // 更新高度
    const maxValue = Math.max(...this.array);
    bars[i].style.height = `${(this.array[i] / maxValue) * 250}px`;
    bars[j].style.height = `${(this.array[j] / maxValue) * 250}px`;

    // 更新数值标签
    bars[i].querySelector(".bar-value").textContent = this.array[i];
    bars[j].querySelector(".bar-value").textContent = this.array[j];

    await new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  // 开始排序（由子类实现）
  async startSorting() {
    throw new Error("startSorting method must be implemented by subclass");
  }

  // 排序完成后的处理
  finishSorting() {
    this.updateBars({ sorted: this.array.length });
    this.isSorting = false;
    this.generateBtn.disabled = false;
    this.sortBtn.disabled = false;
  }
}

// 选择排序实现
class SelectionSort extends SortingVisualizer {
  async startSorting() {
    if (this.isSorting) return;

    this.isSorting = true;
    this.generateBtn.disabled = true;
    this.sortBtn.disabled = true;

    const n = this.array.length;

    for (let i = 0; i < n - 1; i++) {
      let minIndex = i;

      for (let j = i + 1; j < n; j++) {
        this.updateBars({
          current: j,
          min: minIndex,
          sorted: i,
        });
        await new Promise((resolve) => setTimeout(resolve, this.delay));

        if (this.array[j] < this.array[minIndex]) {
          minIndex = j;
        }
      }

      if (minIndex !== i) {
        await this.swap(i, minIndex);
      }
    }

    this.finishSorting();
  }
}

// 冒泡排序实现
class BubbleSort extends SortingVisualizer {
  async startSorting() {
    if (this.isSorting) return;

    this.isSorting = true;
    this.generateBtn.disabled = true;
    this.sortBtn.disabled = true;

    const n = this.array.length;

    for (let i = n - 1; i > 0; i--) {
      // let flag = false;
      for (let j = 0; j < i; j++) {
        this.updateBars({
          comparing: [j, j + 1],
          sorted: n - i,
        });
        await new Promise((resolve) => setTimeout(resolve, this.delay));

        if (this.array[j] > this.array[j + 1]) {
          await this.swap(j, j + 1);
        }
      }
    }

    this.finishSorting();
  }
}

class InsertSort extends SortingVisualizer {
  async startSorting() {
    if (this.isSorting) return;

    this.isSorting = true;
    this.generateBtn.disabled = true;
    this.sortBtn.disabled = true;

    const n = this.array.length;

    // 第一个元素默认已排序
    this.updateBars({
      sorted: 1,
    });
    await new Promise((resolve) => setTimeout(resolve, this.delay));

    for (let i = 0; i < n; i++) {
      const base = this.array[i];
      let j = i - 1;
      while (j >= 0 && this.array[j] > base) {
        this.updateBars({
          current: i,
          comparing: [j, j + 1],
          sorted: i,
        });
        await new Promise((resolve) => setTimeout(resolve, this.delay));
        this.array[j + 1] = this.array[j];
        j--;
      }
      this.array[j + 1] = base;

      // 更新可视化
      const bars = this.arrayContainer.getElementsByClassName("bar");
      const maxValue = Math.max(...this.array);
      for (let k = 0; k <= i; k++) {
        bars[k].style.height = `${(this.array[k] / maxValue) * 250}px`;
        bars[k].querySelector(".bar-value").textContent = this.array[k];
      }

      this.updateBars({
        sorted: i + 1,
      });
      await new Promise((resolve) => setTimeout(resolve, this.delay));
    }

    this.finishSorting();
  }
}

// ... existing code ...

// 快速排序实现
class QuickSort extends SortingVisualizer {
  async startSorting() {
    if (this.isSorting) return;

    this.isSorting = true;
    this.generateBtn.disabled = true;
    this.sortBtn.disabled = true;

    await this.quickSort(0, this.array.length - 1);
    this.finishSorting();
  }

  async quickSort(low, high) {
    if (low < high) {
      const pivotIndex = await this.partition(low, high);
      await this.quickSort(low, pivotIndex - 1);
      await this.quickSort(pivotIndex + 1, high);
    }
  }

  async partition(low, high) {
    const pivot = this.array[high];
    let i = low - 1;

    // 显示基准值
    this.updateBars({
      current: high,
      comparing: [high],
    });
    await new Promise((resolve) => setTimeout(resolve, this.delay));

    for (let j = low; j < high; j++) {
      // 显示当前比较的元素
      this.updateBars({
        current: high,
        comparing: [j, i + 1],
      });
      await new Promise((resolve) => setTimeout(resolve, this.delay));

      if (this.array[j] <= pivot) {
        i++;
        if (i !== j) {
          await this.swap(i, j);
        }
      }
    }

    // 将基准值放到正确位置
    if (i + 1 !== high) {
      await this.swap(i + 1, high);
    }

    return i + 1;
  }
}

// 初始化排序可视化
const selectionSort = new SelectionSort(
  "arrayContainer",
  "generateBtn",
  "sortBtn"
);
const bubbleSort = new BubbleSort(
  "bubbleContainer",
  "bubbleGenerateBtn",
  "bubbleSortBtn"
);
const insertSort = new InsertSort(
  "insertContainer",
  "insertGenerateBtn",
  "insertSortBtn"
);
const quickSort = new QuickSort(
  "quickContainer",
  "quickGenerateBtn",
  "quickSortBtn"
);
