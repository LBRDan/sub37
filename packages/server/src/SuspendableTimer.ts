interface Ticker {
	run(currentTime?: number): void;
}

function createTicker(tickCallback: (currentTime?: number) => void) {
	return {
		run(currentTime?: number) {
			tickCallback(currentTime);
		},
	};
}

export class SuspendableTimer {
	private interval: number = null;
	private ticker: Ticker;

	constructor(private frequency: number, tickCallback: (currentTime?: number) => void) {
		this.ticker = createTicker(tickCallback);
	}

	public start() {
		if (this.isRunning) {
			return;
		}

		this.interval = window.setInterval(this.ticker.run, this.frequency);
	}

	public stop() {
		if (!this.isRunning) {
			return;
		}

		window.clearInterval(this.interval);
		this.interval = null;
	}

	public get isRunning() {
		return Boolean(this.interval);
	}

	/**
	 * Allows executing a function call of the timer
	 * (tick) without waiting for the timer.
	 *
	 * Most useful when the timer is suspended and the
	 * function is run "manually".
	 *
	 * @param currentTime
	 */

	public runTick(currentTime?: number) {
		this.ticker.run(currentTime);
	}
}
