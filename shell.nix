{ pkgs ? import (builtins.fetchTarball "https://github.com/NixOS/nixpkgs/archive/nixpkgs-unstable.tar.gz") {} }:
pkgs.mkShell {
  nativeBuildInputs = with pkgs.buildPackages; [
    # Node.js-related tools
    nodejs_22
    bun
    nodePackages.typescript

    # Utility tools
    zip

    # Java (OpenJDK)
    openjdk
  ];

  shellHook = ''
    export JAVA_HOME=${pkgs.openjdk}/lib/openjdk
    export PATH=$JAVA_HOME/bin:$PATH
    echo "Java is now available in the shell."
  '';
}
