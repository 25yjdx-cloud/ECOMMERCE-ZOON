FROM php:8.3-cli@sha256:48ed67e99726bbccd8ea1ce741dcf6b202263ad74bf70834a600fc37e401279e

ARG COMPOSER_VERSION=2.8.12
ARG COMPOSER_INSTALLER_SHA384=c8b085408188070d5f52bcfe4ecfbee5f727afa458b2573b8eaaf77b3419b0bf2768dc67c86944da1544f06fa544fd47

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        $PHPIZE_DEPS \
        libcurl4-openssl-dev \
        libfreetype6-dev \
        libicu-dev \
        libjpeg62-turbo-dev \
        libonig-dev \
        libpng-dev \
        libwebp-dev \
        libxml2-dev \
        libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        calendar \
        curl \
        gd \
        intl \
        mbstring \
        pdo_mysql \
        zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN set -eux; \
    curl -fsSL https://getcomposer.org/installer -o /tmp/composer-setup.php; \
    echo "${COMPOSER_INSTALLER_SHA384}  /tmp/composer-setup.php" | sha384sum --check --strict; \
    php /tmp/composer-setup.php \
        --no-ansi \
        --install-dir=/usr/local/bin \
        --filename=composer \
        --version="${COMPOSER_VERSION}"; \
    rm /tmp/composer-setup.php; \
    composer --version
