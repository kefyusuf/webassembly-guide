// Minimal Blazor WebAssembly host: mount the App component into #app.
// No router, no layout — the smallest program that boots the .NET runtime
// in the browser.
using BlazorExample;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");

await builder.Build().RunAsync();
