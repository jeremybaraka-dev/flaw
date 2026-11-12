export default {
  title: () => 'File not found',
  render() {
    return `
    <div class="page miss t-ink">
      <div class="mono red">Error 404 · File not found</div>
      <h1 class="d">This file has been <span class="redact is-shut">redacted</span>.</h1>
      <p>Whatever was here is gone, moved, or was never meant to be seen.</p>
      <a class="btn" href="/shop">Back to the evidence locker <span>→</span></a>
    </div>`;
  },
};
