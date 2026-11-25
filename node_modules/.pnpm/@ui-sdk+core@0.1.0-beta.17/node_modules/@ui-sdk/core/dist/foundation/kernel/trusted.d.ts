declare let trusted: (event: Event) => boolean;
declare function trustSent(sent: WeakSet<Event>): void;
export { trusted, trustSent };
