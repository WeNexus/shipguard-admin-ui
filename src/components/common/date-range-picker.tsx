import { ArrowRightIcon, CalendarIcon } from "@shopify/polaris-icons";
import {
  BlockStack,
  Box,
  Button,
  DatePicker,
  Divider,
  Icon,
  InlineGrid,
  InlineStack,
  OptionList,
  Popover,
  Scrollable,
  Select,
  TextField,
  useBreakpoints,
} from "@shopify/polaris";
import { useEffect, useRef, useState } from "react";
const DateRangePicker = ({
  setActiveDates = () => {},
}: {
  setActiveDates?: Function;
}) => {
  const { mdDown, mdUp } = useBreakpoints();
  const shouldShowMultiMonth = mdUp;
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const yesterday = new Date(
    new Date(new Date().setDate(today.getDate() - 1)).setHours(0, 0, 0, 0)
  );
  const ranges = [
    {
      title: "Today",
      alias: "today",
      period: {
        since: today,
        until: today,
      },
    },
    {
      title: "Yesterday",
      alias: "yesterday",
      period: {
        since: yesterday,
        until: yesterday,
      },
    },
    {
      title: "Last 7 days",
      alias: "last7days",
      period: {
        since: new Date(
          new Date(new Date().setDate(today.getDate() - 7)).setHours(0, 0, 0, 0)
        ),
        until: yesterday,
      },
    },
    {
      title: "Last 30 days",
      alias: "last30days",
      period: {
        since: new Date(
          new Date(new Date().setDate(today.getDate() - 30)).setHours(
            0,
            0,
            0,
            0
          )
        ),
        until: yesterday,
      },
    },
    {
      title: "Last 60 days",
      alias: "last60days",
      period: {
        since: new Date(
          new Date(new Date().setDate(today.getDate() - 60)).setHours(
            0,
            0,
            0,
            0
          )
        ),
        until: yesterday,
      },
    },
    {
      alias: "custom",
      title: "Custom",
      period: {
        since: today,
        until: today,
      },
    },
  ];

  const [popoverActive, setPopoverActive] = useState(false);
  const [activeDateRange, setActiveDateRange] = useState(ranges[0]);
  const [inputValues, setInputValues] = useState<{
    until?: string;
    since?: string;
  }>({});

  const [{ month, year }, setDate] = useState({
    month: activeDateRange.period.since.getMonth(),
    year: activeDateRange.period.since.getFullYear(),
  });
  const datePickerRef = useRef(null);
  const VALID_YYYY_MM_DD_DATE_REGEX = /^\d{4}-\d{1,2}-\d{1,2}/;
  function isDate(date: any) {
    return !isNaN(new Date(date).getDate());
  }
  function isValidYearMonthDayDateString(date: any) {
    return VALID_YYYY_MM_DD_DATE_REGEX.test(date) && isDate(date);
  }
  function isValidDate(date: any) {
    return date.length === 10 && isValidYearMonthDayDateString(date);
  }
  function parseYearMonthDayDateString(input: any) {
    const [year, month, day] = input.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  function formatDateToYearMonthDayDateString(date: any) {
    const year = String(date.getFullYear());
    let month = String(date.getMonth() + 1);
    let day = String(date.getDate());
    if (month.length < 2) {
      month = String(month).padStart(2, "0");
    }
    if (day.length < 2) {
      day = String(day).padStart(2, "0");
    }
    return [year, month, day].join("-");
  }
  function formatDate(date: any) {
    return formatDateToYearMonthDayDateString(date);
  }
  function nodeContainsDescendant(rootNode: any, descendant: any) {
    if (rootNode === descendant) {
      return true;
    }
    let parent = descendant.parentNode;
    while (parent != null) {
      if (parent === rootNode) {
        return true;
      }
      parent = parent.parentNode;
    }
    return false;
  }
  function isNodeWithinPopover(node: any) {
    return datePickerRef?.current
      ? nodeContainsDescendant(datePickerRef.current, node)
      : false;
  }
  function handleStartInputValueChange(value: any) {
    setInputValues((prevState) => {
      return { ...prevState, since: value };
    });
    if (isValidDate(value)) {
      const newSince = parseYearMonthDayDateString(value);
      setActiveDateRange((prevState) => {
        const newPeriod =
          prevState.period && newSince <= prevState.period.until
            ? { since: newSince, until: prevState.period.until }
            : { since: newSince, until: newSince };
        return {
          ...prevState,
          period: newPeriod,
        };
      });
    }
  }
  function handleEndInputValueChange(value: any) {
    setInputValues((prevState) => ({ ...prevState, until: value }));
    if (isValidDate(value)) {
      const newUntil = parseYearMonthDayDateString(value);
      setActiveDateRange((prevState) => {
        const newPeriod =
          prevState.period && newUntil >= prevState.period.since
            ? { since: prevState.period.since, until: newUntil }
            : { since: newUntil, until: newUntil };
        return {
          ...prevState,
          period: newPeriod,
        };
      });
    }
  }
  function handleInputBlur(e: any) {
    const relatedTarget = e.relatedTarget;
    const isRelatedTargetWithinPopover =
      relatedTarget != null && isNodeWithinPopover(relatedTarget);
    // If focus moves from the TextField to the Popover
    // we don't want to close the popover
    if (isRelatedTargetWithinPopover) {
      return;
    }
    setPopoverActive(false);
  }
  function handleMonthChange(month: any, year: any) {
    setDate({ month, year });
  }
  function handleCalendarChange({ start, end }: any) {
    const newDateRange = ranges.find((range) => {
      return (
        range.period.since.valueOf() === start.valueOf() &&
        range.period.until.valueOf() === end.valueOf()
      );
    }) || {
      alias: "custom",
      title: "Custom",
      period: {
        since: start,
        until: end,
      },
    };
    setActiveDateRange(newDateRange);
  }
  function apply() {
    setPopoverActive(false);
    setActiveDates(activeDateRange);
  }
  function cancel() {
    setPopoverActive(false);
  }
  useEffect(() => {
    if (activeDateRange) {
      setInputValues({
        since: formatDate(activeDateRange.period.since),
        until: formatDate(activeDateRange.period.until),
      });
      function monthDiff(referenceDate: any, newDate: any) {
        return (
          newDate.month -
          referenceDate.month +
          12 * (referenceDate.year - newDate.year)
        );
      }
      const monthDifference = monthDiff(
        { year, month },
        {
          year: activeDateRange.period.until.getFullYear(),
          month: activeDateRange.period.until.getMonth(),
        }
      );
      if (monthDifference > 1 || monthDifference < 0) {
        setDate({
          month: activeDateRange.period.until.getMonth(),
          year: activeDateRange.period.until.getFullYear(),
        });
      }
    }
  }, [activeDateRange]);
  const buttonValue =
    activeDateRange.title === "Custom"
      ? activeDateRange.period.since.toDateString() +
        " - " +
        activeDateRange.period.until.toDateString()
      : activeDateRange.title;
  return (
    <Popover
      active={popoverActive}
      autofocusTarget="none"
      preferredAlignment="left"
      preferredPosition="below"
      fluidContent
      sectioned={false}
      fullHeight
      activator={
        <Button
          size="medium"
          icon={CalendarIcon}
          onClick={() => setPopoverActive(!popoverActive)}
        >
          {buttonValue}
        </Button>
      }
      onClose={() => setPopoverActive(false)}
    >
      <div className="p-4">
        <Popover.Pane fixed>
          <InlineGrid
            columns={{
              xs: "1fr",
              sm: "max-content max-content",
              md: "max-content max-content",
            }}
          >
            <Box
              maxWidth={mdDown ? "516px" : "150px"}
              width={mdDown ? "100%" : "150px"}
              padding={{ xs: "500", md: "0" }}
              paddingBlockEnd={{ xs: "100", md: "0" }}
              borderInlineEndWidth={mdDown ? "0" : "025"}
              borderColor="border-disabled"
            >
              {mdDown ? (
                <Select
                  label="dateRangeLabel"
                  labelHidden
                  onChange={(value) => {
                    const result = ranges.find(
                      ({ title, alias }) => title === value || alias === value
                    );
                    result && setActiveDateRange(result);
                  }}
                  value={activeDateRange?.title || activeDateRange?.alias || ""}
                  options={ranges.map(({ alias, title }) => title || alias)}
                />
              ) : (
                <Scrollable style={{ height: "334px", borderRight: "#e1e1e1" }}>
                  <OptionList
                    options={ranges.map((range) => ({
                      value: range.alias,
                      label: range.title,
                    }))}
                    selected={[activeDateRange.alias]}
                    onChange={(value) => {
                      setActiveDateRange(
                        ranges.find((range) => range.alias === value[0])!
                      );
                    }}
                  />
                </Scrollable>
              )}
            </Box>
            <Box padding={{ xs: "500" }} maxWidth={mdDown ? "320px" : "526px"}>
              <BlockStack gap="400">
                <InlineStack gap="200">
                  <div className="flex gap-2 items-center">
                    <TextField
                      role="combobox"
                      label={"Since"}
                      labelHidden
                      prefix={<Icon source={CalendarIcon} />}
                      value={inputValues?.since}
                      onChange={handleStartInputValueChange}
                      onBlur={handleInputBlur}
                      autoComplete="off"
                    />
                    <Icon source={ArrowRightIcon} />
                    <TextField
                      role="combobox"
                      label={"Until"}
                      labelHidden
                      prefix={<Icon source={CalendarIcon} />}
                      value={inputValues.until}
                      onChange={handleEndInputValueChange}
                      onBlur={handleInputBlur}
                      autoComplete="off"
                    />
                  </div>
                </InlineStack>
                <div>
                  <DatePicker
                    month={month}
                    year={year}
                    selected={{
                      start: activeDateRange.period.since,
                      end: activeDateRange.period.until,
                    }}
                    onMonthChange={handleMonthChange}
                    onChange={handleCalendarChange}
                    multiMonth={shouldShowMultiMonth}
                    allowRange
                  />
                </div>
              </BlockStack>
            </Box>
          </InlineGrid>
        </Popover.Pane>
        <Divider />
        <Popover.Pane fixed>
          <Popover.Section>
            <InlineStack align="space-between" gap={"200"}>
              <Button onClick={cancel}>Cancel</Button>
              <Button onClick={apply} variant="primary">
                Apply
              </Button>
            </InlineStack>
          </Popover.Section>
        </Popover.Pane>
      </div>
    </Popover>
  );
};

export default DateRangePicker;
