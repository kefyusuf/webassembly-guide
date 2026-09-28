# A minimal image that runs the Rust WASI example (03) with wasmtime —
# no Rust, no wasm target, no toolchain needed on the host:
#
#   docker run --rm -v "$PWD":/data ghcr.io/kefyusuf/webassembly-guide
#
# The module writes wasi-demo.txt to the guest root, which is mapped to
# /data — mount a folder there and the file appears on your machine.
# Without the mount the write fails, demonstrating WASI's capability model:
# permissions come from the runner (--dir), never from the code.

# --- stage 1: compile the Rust WASI example ----------------------------------
FROM rust:1-slim AS build
RUN rustup target add wasm32-wasip1
WORKDIR /src
COPY examples/03-rust-wasi/Cargo.toml examples/03-rust-wasi/Cargo.lock ./
COPY examples/03-rust-wasi/src ./src
RUN cargo build --release --target wasm32-wasip1

# --- stage 2: fetch the static musl wasmtime binary ---------------------------
FROM alpine:3.20 AS wasmtime
ARG WASMTIME_VERSION=1.259.0
RUN apk add --no-cache curl xz \
 && curl -sL -o /tmp/w.tar.xz \
      "https://github.com/bytecodealliance/wasmtime/releases/download/v${WASMTIME_VERSION}/wasmtime-v${WASMTIME_VERSION}-x86_64-linux-musl.tar.xz" \
 && tar -xJf /tmp/w.tar.xz -C /tmp \
 && mv "/tmp/wasmtime-v${WASMTIME_VERSION}-x86_64-linux-musl/wasmtime" /wasmtime

# --- stage 3: the runtime — just wasmtime + the module ------------------------
FROM scratch
COPY --from=wasmtime /wasmtime /wasmtime
COPY --from=build /src/target/wasm32-wasip1/release/rust_wasi_example.wasm /app/main.wasm
ENTRYPOINT ["/wasmtime", "run", "--env", "WASI_USER=docker", "--dir=/data:/", "/app/main.wasm"]
