Feature: User Settings

  Scenario: Successfully update settings
    Given I am logged in as admin
    And user has default settings
    And I navigate to user settings
    When I change properties to:
      | Scene confidence                              | Low             |
      | Semantic search max results                   | Top 50          |
      | Synchronize metadata to disk                  | Save to sidecar |
      | Minimum image rating to interpret as favorite | 5               |
      | Default timezone                              | US/Pacific      |
      | Inferred faces confidence                     | 0.96            |
      | Always transcode videos                       | on              |
    And I save changes
    Then I should see update success notification
    And properties should be:
      | Scene confidence                              | Low             |
      | Semantic search max results                   | Top 50          |
      | Synchronize metadata to disk                  | Save to sidecar |
      | Minimum image rating to interpret as favorite | 5               |
      | Default timezone                              | US/Pacific      |
      | Inferred faces confidence                     | 0.96            |
      | Always transcode videos                       | on              |

  Scenario: Revert settings to defaults when canceled
    Given I am logged in as admin
    And user has default settings
    And I navigate to user settings
    When I change properties to:
      | Scene confidence                              | Low             |
      | Semantic search max results                   | Top 50          |
      | Synchronize metadata to disk                  | Save to sidecar |
      | Minimum image rating to interpret as favorite | 5               |
      | Default timezone                              | US/Pacific      |
      | Inferred faces confidence                     | 0.96            |
      | Always transcode videos                       | on              |
    And I cancel saving changes
    Then properties should be:
      | Scene confidence                              | Standard        |
      | Semantic search max results                   | Disabled        |
      | Synchronize metadata to disk                  | Off             |
      | Minimum image rating to interpret as favorite | 4               |
      | Default timezone                              | UTC             |
      | Inferred faces confidence                     | 0.90            |
      | Always transcode videos                       | off             |

  Scenario: Date time rules are displayed correctly
    Given I am logged in as admin
    And user has default settings
    And I navigate to user settings
    Then I should see default date time rules displayed correctly

  Scenario: Successfully save date time rules after removing rule
    Given I am logged in as admin
    And user has default settings
    And I navigate to user settings
    When I delete rule with ID "1"
    And I save changes
    Then date time rules should not contain rule with ID "1"

  Scenario: Cancel updated date time rules
    Given I am logged in as admin
    And user has default settings
    And I navigate to user settings
    When I delete rule with ID "15"
    Then date time rules should not contain rule with ID "15"
    When I cancel saving changes
    Then date time rules should contain rule with ID "15"
