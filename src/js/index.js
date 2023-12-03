export class App {
    constructor() {
        this.readCounter = document.getElementById("read-counter");
        this.writeCounter = document.getElementById("write-counter");
        this.sortTypeRadioElement = document.getElementsByName("sort-type");
        this.canvas = document.querySelector("canvas");

        this.inputDelayElement = document.getElementById("input-delay");
        this.inputDelayElement.addEventListener("input", this.inputDelayValidation.bind(this));

        this.startButtonElement = document.getElementById("start-button");
        this.startButtonElement.addEventListener("click", this.startHandler.bind(this));

        this.stopButtonElement = document.getElementById("stop-button");

        this.pushRandomButtons = document.getElementById("push-random-button");
        this.pushRandomButtons.addEventListener("click", this.insertRandomValues.bind(this));

        this.inputValuesElement = document.getElementById("values-textarea");
        this.inputValuesElement.addEventListener("input", this.inputValuesValidation.bind(this));

        this.isSirtingNow = false;

        this.values = [];
        this.delayValue = 10;
        this.readingIndexes = [];
        this.writingIndexes = [];
        this.insertRandomValues();
    }

    inputDelayValidation() {
        this.delayValue = Math.trunc(+this.inputDelayElement.value);
        this.inputDelayElement.value = this.delayValue;
    }

    inputValuesValidation() {
        let text = this.inputValuesElement.value.replace(/[^0-9,]/g, "");
        this.inputValuesElement.value = text;
        this.values = text.split(",").map((El) => +El);
        this.drawCanvas();
    }

    getSelectedSortType() {
        for (let Radio of this.sortTypeRadioElement) {
            if (Radio.checked) return Radio.value;
        }
    }

    startHandler() {
        if (this.isSirtingNow) return;
        const type = this.getSelectedSortType();
        this.prepareToSort();
        this.sortMethods[type]().then((_) => this.afterSort());
    }

    async delay(time) {
        const prom = new Promise((res, rej) => {
            setTimeout(
                () => {
                    res();
                },
                time ? time : this.delayValue
            );
        });
        await prom;
        return;
    }

    prepareToSort() {
        this.readCounter.innerText = 0;
        this.writeCounter.innerText = 0;
        this.inputValuesElement.disabled = true;
        this.inputDelayElement.disabled = true;
        this.sortTypeRadioElement.forEach((El) => (El.disabled = true));
        this.startButtonElement.style.color = "gray";
        this.startButtonElement.style.cursor = "not-allowed";
        this.stopButtonElement.style.color = "black";
        this.stopButtonElement.style.cursor = "pointer";
        this.pushRandomButtons.style.color = "gray";
        this.pushRandomButtons.style.cursor = "not-allowed";
    }

    afterSort() {
        this.inputValuesElement.disabled = false;
        this.inputDelayElement.disabled = false;
        this.sortTypeRadioElement.forEach((El) => (El.disabled = false));
        this.startButtonElement.style.color = "black";
        this.startButtonElement.style.cursor = "pointer";
        this.pushRandomButtons.style.color = "black";
        this.pushRandomButtons.style.cursor = "pointer";
        this.stopButtonElement.style.color = "gray";
        this.stopButtonElement.style.cursor = "not-allowed";
    }

    async showReadedValues(indexes) {
        this.readingIndexes = indexes;
        this.drawCanvas();
        const count = +this.readCounter.innerText + indexes.length;
        this.readCounter.innerText = count;
        await this.delay();
        this.readingIndexes = [];
        this.drawCanvas();
        return;
    }

    async showWritedValues(indexes) {
        this.writingIndexes = indexes;
        this.drawCanvas();
        const count = +this.writeCounter.innerText + indexes.length;
        this.writeCounter.innerText = count;
        await this.delay();
        this.writingIndexes = [];
        this.drawCanvas();
        return;
    }

    sortMethods = {
        bubble: async () => {
            let stopped = false;
            this.stopButtonElement.addEventListener("click", () => (stopped = true));
            let isReplaced = false;
            let arr = this.values;
            do {
                if (stopped) return;
                isReplaced = false;
                for (let i = 1; i < arr.length; i++) {
                    await this.showReadedValues([i, i - 1]);
                    if (arr[i] < arr[i - 1]) {
                        await this.showWritedValues([i, i - 1]);
                        isReplaced = true;
                        const temp = arr[i - 1];
                        arr[i - 1] = arr[i];
                        arr[i] = temp;
                        this.drawCanvas();
                    }
                }
            } while (isReplaced);
            this.drawCanvas();
            return;
        },

        replace: async () => {
            let stopped = false;
            this.stopButtonElement.addEventListener("click", () => (stopped = true));
            let arr = this.values;
            let unsortLength = arr.length;
            do {
                let max = 0;
                let maxInd = undefined;
                for (let i = 0; i < unsortLength; i++) {
                    if (stopped) return;
                    await this.showReadedValues([i]);
                    if (arr[i] > max) {
                        max = arr[i];
                        maxInd = i;
                    }
                }
                this.showWritedValues([maxInd, unsortLength - 1]);
                const temp = arr[maxInd];
                arr[maxInd] = arr[unsortLength - 1];
                arr[unsortLength - 1] = temp;
                this.drawCanvas();
                unsortLength--;
            } while (unsortLength !== 0);
        },

        insert: async () => {
            let stopped = false;
            this.stopButtonElement.addEventListener("click", () => (stopped = true));
            let arr = this.values;
            for (let i = 1, l = arr.length; i < l; i++) {
                const current = arr[i];
                await this.showReadedValues([i]);
                let j = i;
                while (j > 0 && arr[j - 1] > current) {
                    if (stopped) return;
                    await this.showReadedValues([j, j - 1, i]);
                    await this.showWritedValues([j, j - 1]);
                    arr[j] = arr[j - 1];
                    this.drawCanvas();
                    await this.delay();
                    j--;
                }
                arr[j] = current;
            }
            this.drawCanvas();
        },

        select: async () => {
            let stopped = false;
            this.stopButtonElement.addEventListener("click", () => (stopped = true));
            let arr = this.values;
            let n = arr.length;

            for (let i = 0; i < n; i++) {
                let min = i;
                for (let j = i; j < n; j++) {
                    await this.showReadedValues([j, min]);
                    if (stopped) return;
                    if (arr[j] < arr[min]) {
                        min = j;
                    }
                }
                if (min != i) {
                    await this.showWritedValues([i, min]);
                    let tmp = arr[i];
                    arr[i] = arr[min];
                    arr[min] = tmp;
                    this.drawCanvas();
                    await this.delay();
                }
            }
        },

        shell: async () => {
            let stopped = false;
            this.stopButtonElement.addEventListener("click", () => (stopped = true));
            let arr = this.values;
            const l = arr.length;
            let gap = Math.floor(l / 2);
            while (gap >= 1) {
                for (let i = gap; i < l; i++) {
                    await this.showReadedValues([i]);
                    const current = arr[i];
                    let j = i;
                    await this.showReadedValues([j - gap]);
                    while (j > 0 && arr[j - gap] > current) {
                        if (stopped) return;
                        await this.showWritedValues([j, j - gap]);
                        arr[j] = arr[j - gap];
                        this.drawCanvas();
                        await this.delay();
                        j -= gap;
                    }
                    await this.showReadedValues([j]);
                    arr[j] = current;
                    this.drawCanvas();
                    await this.delay();
                }
                gap = Math.floor(gap / 2);
            }
        },
    };

    insertRandomValues() {
        if (this.isSirtingNow) return;
        this.values = [];
        while (this.values.length !== 50) {
            const value = Math.trunc(Math.random() * 50) + 1;
            if (!this.values.includes(value)) this.values.push(value);
        }
        this.inputValuesElement.value = this.values.join(",");
        this.drawCanvas();
    }

    clearCanavas() {
        const context = this.canvas.getContext("2d");
        context.clearRect(0, 0, 800, 600);
    }

    drawCanvas() {
        this.clearCanavas();
        const context = this.canvas.getContext("2d");
        const elementWidth = Math.trunc(800 / this.values.length);
        const maxElement = Math.max(...this.values);
        const elementHeightCoef = Math.trunc(600 / maxElement);
        this.values.forEach((Element, Index) => {
            const isReading = this.readingIndexes.includes(Index);
            const isWriting = this.writingIndexes.includes(Index);
            const x = Index * elementWidth;
            const y = 600 - Element * elementHeightCoef;
            const elementHeight = elementHeightCoef * Element;
            context.beginPath();
            context.lineWidth = 1;
            context.strokeStyle = "black";
            if (isWriting) {
                context.fillStyle = "red";
            } else if (isReading) {
                context.fillStyle = "green";
            } else context.fillStyle = "gray";
            context.fillRect(x, y, elementWidth, elementHeight);
            context.strokeRect(x, y, elementWidth, elementHeight);
            context.stroke();
        });
        this.inputValuesElement.value = this.values.join(",");
    }
}

const PageApp = new App();
