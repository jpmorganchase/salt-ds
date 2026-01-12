declare namespace Cypress {
  interface Chainable {
    /**
     * Set Theme Mode
     * @example
     * cy.setMode('light')
     */
    setMode(theme: SupportedThemeMode): Chainable<void>;

    /**
     * Set Density
     *
     * @example
     * cy.setDensity('medium')
     */
    setDensity(theme: SupportedDensity): Chainable<void>;

    /**
     * Check a11y with Axe
     *
     * @example
     * cy.checkAxeComponent()
     */
    checkAxeComponent(
      options?: Options,
      enableFailures?: boolean,
    ): Chainable<void>;

    /**
     * Set the date adapter to be used by mounted tests
     * @param adapter
     */
    setDateAdapter(
      adapter: SaltDateAdapter<DateFrameworkType>,
    ): Chainable<void>;

    /**
     * Set the date locale used by the date adapter
     * @param {unknown} locale
     */
    setDateLocale(locale: unknown): Chainable<void>;

    /**
     * Mount a React component with Salt Provider and React Profiler
     * @param jsx
     * @param options
     */
    mountPerformance(
      jsx: ReactNode,
      options?: MountOptions,
    ): Chainable<MountReturn>;

    /**
     * Mount a React component with Salt Provider
     * @param jsx
     * @param options
     */
    mount(jsx: ReactNode, options?: MountOptions): Chainable<MountReturn>;

    /**
     * Get the render count from the last mounted component with mountPerformance
     */
    getRenderCount(): Chainable<number>;

    /**
     * Get the render time from the last mounted component with mountPerformance
     */
    getRenderTime(): Chainable<number>;

    /**
     * Simulate paste event.
     * @param string
     */
    paste(string: string): Chainable<void>;
  }

  interface Chainer<Subject> {
    /**
       * Checks if the accessible name computation (according to `accname` spec)
       * matches the expectation.
       *
       * @example
       ```
       cy.findByRole('button).should('have.accessibleName','Close')
       ```
       * */
    (chainer: "have.accessibleName"): Chainable<Subject>;
    /**
       * Checks if the accessible name computation (according to `accname` spec)
       * does NOT match the expectation.
       *
       * @example
       ```
       cy.findByRole('button).should('not.have.accessibleName','Close')
       ```
       * */
    (chainer: "not.have.accessibleName"): Chainable<Subject>;
    /**
       * Checks if the accessible name computation (according to `accname` spec)
       * matches the expectation.
       *
       * @example
       ```
       cy.findByRole('button).should('have.accessibleDescription','Close')
       ```
       * */
    (chainer: "have.accessibleDescription"): Chainable<Subject>;
    /**
       * Checks if the accessible name computation (according to `accname` spec)
       * does NOT match the expectation.
       *
       * @example
       ```
       cy.findByRole('button).should('not.have.accessibleDescription','Close')
       ```
       * */
    (chainer: "not.have.accessibleDescription"): Chainable<Subject>;
    /**
       * Checks if the announcement is matches the expectation.
       *
       * @example
       ```
       cy.findByRole('button).click().should('announce','Close')
       ```
       * */
    (chainer: "announce"): Chainable<Subject>;
    /**
       * Checks if the approriate saltHighlighted className has been applied.
       *
       * @example
       ```
       cy.findByRole('option).should('be.highlighted')
       ```
       * */
    (chainer: "be.highlighted"): Chainable<Subject>;
    /**
       * Checks if the approriate saltHighlighted className has been applied.
       *
       * @example
       ```
       cy.findByRole('option).should('be.highlighted')
       ```
       * */
    (chainer: "not.be.highlighted"): Chainable<Subject>;
    /**
       * Checks that the aria-selected attribute has been applied.
       *
       * @example
       ```
       cy.findByRole('option).should('have.ariaSelected')
       ```
       * */
    (chainer: "have.ariaSelected"): Chainable<Subject>;
    /**
       * Checks that the aria-selected attribute is not present.
       *
       * @example
       ```
       cy.findByRole('option).should('not.have.ariaSelected')
       ```
       * */
    (chainer: "not.have.ariaSelected"): Chainable<Subject>;
    /**
       * Checks if the approriate saltFocusVisible className has been applied.
       *
       * @example
       ```
       cy.findByRole('option).should('have.focusVisible')
       ```
       * */
    (chainer: "be.focusVisible"): Chainable<Subject>;
    (chainer: "have.focusVisible"): Chainable<Subject>;
    /**
       * Checks if the approriate saltFocusVisible className has been applied.
       *
       * @example
       ```
       cy.findByRole('option).should('not.have.focusVisible')
       ```
       * */
    (chainer: "not.be.focusVisible"): Chainable<Subject>;
    (chainer: "not.have.focusVisible"): Chainable<Subject>;
    /**
       * Checks if the element is in the viewport.
       *
       * @example
       ```
       cy.findByRole('option).should('be.inTheViewport')
       ```
       * */
    (chainer: "be.inTheViewport"): Chainable<Subject>;
    /**
       * Checks if the element is not in the viewport.
       *
       * @example
       ```
       cy.findByRole('option).should('not.be.inTheViewport')
       ```
       * */
    (chainer: "not.be.inTheViewport"): Chainable<Subject>;
    /**
       * Checks if the element is the active descendant.
       *
       * @example
       ```
       cy.findByRole('option).should('be.activeDescendant')
       ```
       * */
    (chainer: "be.activeDescendant"): Chainable<Subject>;
    /**
       * Checks if the element is not the active descendant.
       *
       * @example
       ```
       cy.findByRole('option).should('not.be.activeDescendant')
       ```
       * */
    (chainer: "not.be.activeDescendant"): Chainable<Subject>;
  }
}
