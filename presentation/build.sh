#!/usr/bin/env bash
set -euo pipefail

tectonic presentation/main.tex --outdir presentation/build
pdftoppm -png -f 1 -singlefile presentation/build/main.pdf presentation/build/title-slide
