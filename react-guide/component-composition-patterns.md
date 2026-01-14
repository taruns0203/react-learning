# 🧩 Component Composition Patterns: Children, Slots & Compound Components

> **FAANG Interview Mastery Guide** | Estimated Total Time: ~2.5 hours

---

## 1. 🎯 CONCEPT OVERVIEW (5 min read)

### What Is Component Composition?

Component composition is React's **fundamental paradigm** for building complex UIs from simple, reusable pieces. Instead of inheritance, React uses composition to share code between components.

### The Three Patterns

| Pattern | Description | Use When |
|---------|-------------|----------|
| **Children Prop** | Pass content between component tags | Simple content projection |
| **Slots** | Named placeholders for multiple content areas | Multiple content regions |
| **Compound Components** | Components that work together sharing implicit state | Complex, stateful UI patterns |

### What Problem Does It Solve?

1. **Avoids Prop Drilling** - Pass UI without threading through intermediaries
2. **Increases Reusability** - Components become more flexible containers
3. **Enforces Separation of Concerns** - Container logic vs. content
4. **Enables Inversion of Control** - Parent controls what child renders

### 💡 One-Sentence Interview Summary

> "Component composition uses the children prop and compound component patterns to build flexible, reusable UIs by letting parent components control what gets rendered inside child containers, avoiding prop drilling and enabling inversion of control."

---

## 2. 🧠 MENTAL MODEL (10 min read)

### The "Slot Machine" Analogy 🎰

Think of a React component as a **slot machine** with designated slots:

```
┌─────────────────────────────────────┐
│        CARD COMPONENT               │
│  ┌─────────────────────────────┐    │
│  │     [HEADER SLOT]           │    │  ← Named slot
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │     {children}              │    │  ← Default slot
│  │     (BODY SLOT)             │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │     [FOOTER SLOT]           │    │  ← Named slot
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### The Three Mental Models

#### 1. Children = Default Slot (Like `<slot>` in Web Components)

```jsx
// Parent "projects" content INTO the child
<Modal>
  <p>I appear inside Modal's {children} slot</p>
</Modal>
```

#### 2. Named Props = Named Slots

```jsx
// Multiple "ports" to inject content
<Card 
  header={<Title>Hello</Title>}      // Named slot
  footer={<Button>Save</Button>}     // Named slot
>
  <p>Body content</p>                 {/* Default slot */}
</Card>
```

#### 3. Compound Components = Controlled Slots with Shared Brain

```jsx
// Components share implicit state via Context
<Tabs>
  <Tabs.List>                      {/* Knows about Tabs state */}
    <Tabs.Tab index={0}>One</Tabs.Tab>
    <Tabs.Tab index={1}>Two</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panels>
    <Tabs.Panel index={0}>Content 1</Tabs.Panel>
    <Tabs.Panel index={1}>Content 2</Tabs.Panel>
  </Tabs.Panels>
</Tabs>
```

### The "Aha Moment" 💡

> **Children is just a prop!** When you write `<Parent><Child/></Parent>`, React transforms this into `Parent({ children: <Child/> })`. The JSX syntax is sugar hiding that `children` is simply a prop like any other.

```jsx
// These are IDENTICAL:
<Container><Content /></Container>
Container({ children: <Content /> })
```

### Connection to Other React Concepts

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPOSITION ECOSYSTEM                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Props ──────► children prop ──────► Content Projection    │
│                      │                                       │
│                      ▼                                       │
│   Context ────► Compound Components ────► Shared State      │
│                      │                                       │
│                      ▼                                       │
│   Render Props ◄──── HOCs ◄──── Code Reuse Alternatives    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 🔬 DEEP INTERNALS (15 min read)

### How `children` Works Under the Hood

#### Step 1: JSX Transformation

```jsx
// What you write:
<Parent>
  <Child name="A" />
  <Child name="B" />
</Parent>

// What Babel/SWC produces (React 17+):
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';

_jsxs(Parent, {
  children: [
    _jsx(Child, { name: "A" }),
    _jsx(Child, { name: "B" })
  ]
});
```

#### Step 2: The Props Object

The `children` prop can be:

| Type | When | Example |
|------|------|---------|
| `undefined` | No children | `<Comp />` |
| `ReactElement` | Single child | `<Comp><One/></Comp>` |
| `Array<ReactElement>` | Multiple children | `<Comp><One/><Two/></Comp>` |
| `string` | Text content | `<Comp>Hello</Comp>` |
| `number` | Numeric content | `<Comp>{42}</Comp>` |
| `Function` | Render prop | `<Comp>{(x) => x}</Comp>` |

#### Step 3: Fiber Tree Creation

```
FiberNode (Parent)
├── props.children: [FiberRef, FiberRef]
├── child: FiberNode (Child A)  ← First child
│   └── sibling: FiberNode (Child B)  ← Linked list
└── ...
```

### React.Children Utilities (Simplified Source)

```javascript
// Simplified from React source: packages/react/src/ReactChildren.js

const ReactChildren = {
  // Safely iterate children (handles all types)
  forEach(children, callback) {
    if (children == null) return;
    
    if (Array.isArray(children)) {
      children.forEach((child, index) => callback(child, index));
    } else {
      callback(children, 0);
    }
  },
  
  // Map with key preservation
  map(children, callback) {
    if (children == null) return children;
    
    const result = [];
    this.forEach(children, (child, index) => {
      result.push(callback(child, index));
    });
    return result;
  },
  
  // Count children (flattens nested arrays)
  count(children) {
    let count = 0;
    this.forEach(children, () => count++);
    return count;
  },
  
  // Convert to flat array
  toArray(children) {
    const result = [];
    this.forEach(children, child => result.push(child));
    return result;
  },
  
  // Assert single child
  only(children) {
    if (!isValidElement(children)) {
      throw new Error('React.Children.only expected single React element');
    }
    return children;
  }
};
```

### Why Compound Components Use Context

```javascript
// The "implicit state sharing" mechanism

// 1. Parent creates context value
const TabsContext = createContext(null);

function Tabs({ children }) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Stable reference to prevent re-renders
  const value = useMemo(() => ({
    activeIndex,
    setActiveIndex
  }), [activeIndex]);
  
  return (
    <TabsContext.Provider value={value}>
      {children}
    </TabsContext.Provider>
  );
}

// 2. Children consume context (no prop drilling!)
function Tab({ index, children }) {
  const { activeIndex, setActiveIndex } = useContext(TabsContext);
  
  return (
    <button 
      onClick={() => setActiveIndex(index)}
      aria-selected={activeIndex === index}
    >
      {children}
    </button>
  );
}
```

### Design Decision: Why Not Inheritance?

React chose composition over inheritance because:

1. **Predictability**: Props flow down, events flow up
2. **Flexibility**: Any component can be passed as children
3. **Testing**: Components are isolated units
4. **Performance**: React can optimize re-renders per-component

---

## 4. 📝 SYNTAX & API (5 min read)

### Children Prop TypeScript Signatures

```typescript
// Basic children types
interface Props {
  children?: React.ReactNode;  // Most flexible: any renderable
}

interface StrictProps {
  children: React.ReactElement;  // Single element only
}

interface ArrayProps {
  children: React.ReactElement[];  // Array of elements
}

interface FunctionProps {
  children: (value: string) => React.ReactNode;  // Render prop
}

// React.ReactNode includes:
type ReactNode = 
  | ReactElement
  | string
  | number
  | boolean
  | null
  | undefined
  | ReactFragment
  | ReactPortal;
```

### React.Children API Reference

```typescript
namespace React.Children {
  // Iterate over children
  function forEach<C>(
    children: C,
    fn: (child: C extends (infer T)[] ? T : C, index: number) => void
  ): void;

  // Map children with keys preserved
  function map<T, C>(
    children: C,
    fn: (child: C extends (infer T)[] ? T : C, index: number) => T
  ): T[];

  // Count renderable children
  function count(children: ReactNode): number;

  // Flatten to array
  function toArray(children: ReactNode): ReactElement[];

  // Assert exactly one child
  function only<C>(children: C): C;
}
```

### React.cloneElement API

```typescript
function cloneElement<P>(
  element: ReactElement<P>,
  props?: Partial<P> & { key?: Key; ref?: Ref<any> },
  ...children: ReactNode[]
): ReactElement<P>;

// Example: Inject props into children
React.cloneElement(child, { 
  className: 'injected',
  onClick: handleClick 
});
```

### Slot Pattern Signatures

```typescript
// Named slots via props
interface CardProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

// Compound component pattern
interface TabsComponent extends React.FC<TabsProps> {
  Tab: React.FC<TabProps>;
  Panel: React.FC<PanelProps>;
  List: React.FC<ListProps>;
}
```

---

## 5. 💻 CODE EXAMPLES (15 min read)

### Example 1: Basic Usage - Simple Card with Children

```jsx
// ✅ BASIC: Card component with children slot
function Card({ children, title }) {
  return (
    <div className="card">
      {/* Static part */}
      <h2 className="card-title">{title}</h2>
      
      {/* Dynamic part - whatever parent passes */}
      <div className="card-body">
        {children}  {/* 👈 The "slot" */}
      </div>
    </div>
  );
}

// Usage - parent controls content
function App() {
  return (
    <Card title="Welcome">
      <p>This paragraph appears in card-body</p>
      <button>Click me</button>
    </Card>
  );
}

/*
Rendered HTML:
<div class="card">
  <h2 class="card-title">Welcome</h2>
  <div class="card-body">
    <p>This paragraph appears in card-body</p>
    <button>Click me</button>
  </div>
</div>
*/
```

**Line-by-line:**
- Line 2: `children` is destructured from props
- Line 8: `{children}` renders whatever was between `<Card>` tags
- Line 15-18: Content between tags becomes `children`

---

### Example 2: Real-World Usage - Modal with Slots

```jsx
import { createPortal } from 'react-dom';

// 🏭 PRODUCTION: Modal with header, body, footer slots
function Modal({ 
  isOpen, 
  onClose, 
  header,      // Named slot
  footer,      // Named slot
  children,    // Default slot (body)
  size = 'md'
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal modal-${size}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header Slot */}
        {header && (
          <div className="modal-header">
            {header}
            <button 
              className="modal-close" 
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        )}
        
        {/* Body Slot (default) */}
        <div className="modal-body">
          {children}
        </div>
        
        {/* Footer Slot */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

// Usage
function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      size="lg"
      header={<h2>Confirm Action</h2>}
      footer={
        <>
          <button onClick={() => setIsOpen(false)}>Cancel</button>
          <button className="primary">Confirm</button>
        </>
      }
    >
      <p>Are you sure you want to proceed?</p>
      <p>This action cannot be undone.</p>
    </Modal>
  );
}
```

---

### Example 3: Advanced Usage - Compound Components (Tabs)

```jsx
import { createContext, useContext, useState, useMemo, useId } from 'react';

// 1️⃣ Create shared context
const TabsContext = createContext(null);

// 2️⃣ Custom hook for consuming context with error boundary
function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within <Tabs>');
  }
  return context;
}

// 3️⃣ Parent component - provides state
function Tabs({ children, defaultIndex = 0, onChange }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const id = useId();  // Unique ID for accessibility
  
  const handleChange = (index) => {
    setActiveIndex(index);
    onChange?.(index);
  };
  
  // Memoize to prevent context re-renders
  const value = useMemo(() => ({
    activeIndex,
    setActiveIndex: handleChange,
    tabsId: id
  }), [activeIndex, id]);
  
  return (
    <TabsContext.Provider value={value}>
      <div className="tabs" data-tabs-id={id}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// 4️⃣ Tab List - container for tabs
function TabList({ children, className = '' }) {
  return (
    <div className={`tab-list ${className}`} role="tablist">
      {children}
    </div>
  );
}

// 5️⃣ Individual Tab - interactive button
function Tab({ children, index, disabled = false }) {
  const { activeIndex, setActiveIndex, tabsId } = useTabsContext();
  const isActive = activeIndex === index;
  
  return (
    <button
      role="tab"
      id={`${tabsId}-tab-${index}`}
      aria-controls={`${tabsId}-panel-${index}`}
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      className={`tab ${isActive ? 'tab-active' : ''}`}
      onClick={() => setActiveIndex(index)}
    >
      {children}
    </button>
  );
}

// 6️⃣ Tab Panels container
function TabPanels({ children }) {
  return <div className="tab-panels">{children}</div>;
}

// 7️⃣ Individual Panel - content area
function TabPanel({ children, index }) {
  const { activeIndex, tabsId } = useTabsContext();
  const isActive = activeIndex === index;
  
  if (!isActive) return null;
  
  return (
    <div
      role="tabpanel"
      id={`${tabsId}-panel-${index}`}
      aria-labelledby={`${tabsId}-tab-${index}`}
      className="tab-panel"
      tabIndex={0}
    >
      {children}
    </div>
  );
}

// 8️⃣ Attach sub-components (compound pattern)
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

export { Tabs };

// 📌 USAGE
function App() {
  return (
    <Tabs defaultIndex={0} onChange={(i) => console.log('Tab:', i)}>
      <Tabs.List>
        <Tabs.Tab index={0}>Profile</Tabs.Tab>
        <Tabs.Tab index={1}>Settings</Tabs.Tab>
        <Tabs.Tab index={2} disabled>Admin</Tabs.Tab>
      </Tabs.List>
      
      <Tabs.Panels>
        <Tabs.Panel index={0}>
          <h3>Profile Content</h3>
          <p>Your profile information here.</p>
        </Tabs.Panel>
        <Tabs.Panel index={1}>
          <h3>Settings Content</h3>
          <p>Configure your preferences.</p>
        </Tabs.Panel>
        <Tabs.Panel index={2}>
          <h3>Admin Content</h3>
        </Tabs.Panel>
      </Tabs.Panels>
    </Tabs>
  );
}
```

---

### Example 4: Anti-Pattern and Fix

```jsx
// ❌ ANTI-PATTERN: Mutating children directly
function BadCard({ children }) {
  // WRONG: Trying to modify children directly
  children.props.className = 'modified';  // 💥 ERROR! Props are read-only
  
  return <div className="card">{children}</div>;
}

// ❌ ANTI-PATTERN: Using array index without understanding implications
function BadList({ children }) {
  return (
    <ul>
      {React.Children.map(children, (child, index) => (
        // WRONG: Using index as key for dynamic lists
        <li key={index}>{child}</li>  // 💥 Causes bugs on reorder
      ))}
    </ul>
  );
}

// ❌ ANTI-PATTERN: Over-relying on cloneElement
function BadButtonGroup({ children }) {
  return (
    <div>
      {React.Children.map(children, (child) => 
        // WRONG: cloneElement is fragile, breaks with wrappers
        React.cloneElement(child, { 
          className: 'group-button'
        })
      )}
    </div>
  );
}

// ✅ FIX 1: Use cloneElement properly
function GoodCard({ children }) {
  return (
    <div className="card">
      {React.Children.map(children, child => 
        React.isValidElement(child)
          ? React.cloneElement(child, {
              className: `${child.props.className || ''} modified`.trim()
            })
          : child
      )}
    </div>
  );
}

// ✅ FIX 2: Use render props for flexibility
function GoodList({ items, renderItem }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// ✅ FIX 3: Use Context for compound components
const ButtonGroupContext = createContext({ size: 'md' });

function GoodButtonGroup({ children, size = 'md' }) {
  return (
    <ButtonGroupContext.Provider value={{ size }}>
      <div className="button-group" role="group">
        {children}
      </div>
    </ButtonGroupContext.Provider>
  );
}

function GroupButton({ children }) {
  const { size } = useContext(ButtonGroupContext);
  return <button className={`btn btn-${size}`}>{children}</button>;
}
```

---

## 6. ⚠️ COMMON MISTAKES & PITFALLS (10 min read)

### Mistake 1: Assuming `children` is Always an Array

```jsx
// ❌ WRONG
function Wrapper({ children }) {
  return children.map(child => <div>{child}</div>);  // 💥 Crashes with single child!
}

// ✅ CORRECT
function Wrapper({ children }) {
  return React.Children.map(children, child => <div>{child}</div>);
}

// WHY: Single child = element, multiple = array. React.Children handles both.
```

### Mistake 2: Over-using cloneElement

```jsx
// ❌ WRONG - Fragile, breaks with HOCs/wrappers
function Accordion({ children }) {
  const [openIndex, setOpenIndex] = useState(0);
  
  return React.Children.map(children, (child, index) =>
    React.cloneElement(child, {
      isOpen: index === openIndex,
      onToggle: () => setOpenIndex(index)
    })
  );  // 💥 Breaks if child is wrapped: <div><AccordionItem/></div>
}

// ✅ CORRECT - Use Context
const AccordionContext = createContext(null);

function Accordion({ children }) {
  const [openIndex, setOpenIndex] = useState(0);
  
  return (
    <AccordionContext.Provider value={{ openIndex, setOpenIndex }}>
      {children}
    </AccordionContext.Provider>
  );
}
```

### Mistake 3: Not Handling null/undefined Children

```jsx
// ❌ WRONG
function Layout({ sidebar, children }) {
  return (
    <div className="layout">
      <aside>{sidebar}</aside>  {/* May render empty <aside> */}
      <main>{children}</main>
    </div>
  );
}

// ✅ CORRECT
function Layout({ sidebar, children }) {
  return (
    <div className="layout">
      {sidebar && <aside>{sidebar}</aside>}  {/* Conditional render */}
      <main>{children}</main>
    </div>
  );
}
```

### Mistake 4: Missing Context Error Boundaries

```jsx
// ❌ WRONG - Silent failure
function Tab({ index }) {
  const context = useContext(TabsContext);  // May be null!
  return <button onClick={() => context.setActive(index)}>...</button>;  // 💥
}

// ✅ CORRECT - Fail fast with helpful message
function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(
      'Tab must be used within a <Tabs> component. ' +
      'Make sure you have wrapped your Tab components with <Tabs>.'
    );
  }
  return context;
}
```

### Mistake 5: Recreating Context Value Every Render

```jsx
// ❌ WRONG - Creates new object every render
function Tabs({ children }) {
  const [active, setActive] = useState(0);
  
  return (
    <TabsContext.Provider value={{ active, setActive }}>  {/* 💥 New obj */}
      {children}
    </TabsContext.Provider>
  );
}

// ✅ CORRECT - Memoize value
function Tabs({ children }) {
  const [active, setActive] = useState(0);
  
  const value = useMemo(() => ({ active, setActive }), [active]);
  
  return (
    <TabsContext.Provider value={value}>
      {children}
    </TabsContext.Provider>
  );
}
```

---

## 7. 🎭 INTERVIEW SCENARIOS (10 min read)

### Conceptual Questions & Model Answers

**Q1: "What is the children prop and how does it differ from regular props?"**

> **Answer**: "The `children` prop is a special prop that receives content placed between a component's opening and closing tags. Unlike regular props which are explicitly passed as attributes, children is implicit from the JSX structure. Under the hood, JSX transforms `<Parent><Child/></Parent>` into `Parent({ children: <Child/> })`. The key difference is syntactic - children enables a more natural nesting syntax, making components feel like HTML containers. This is crucial for creating layout components, where you want the parent to control the structure while letting consumers control the content."

**Q2: "When would you use compound components over regular props?"**

> **Answer**: "I'd use compound components when: (1) multiple sub-components need to share state without prop drilling, (2) the API would require many configuration props that clutter the interface, (3) consumers need flexibility in arranging sub-components, or (4) the components are tightly coupled and don't make sense used separately. Examples include Tabs, Accordion, Menu, or Select components. The trade-off is more boilerplate with Context setup, but the API becomes more intuitive - `<Tabs.Tab>` is clearer than `<Tab tabsRef={tabsRef} index={0}>`."

**Q3: "How would you handle props injection into children without cloneElement?"**

> **Answer**: "I'd use three alternatives: (1) **Context** - the parent provides values via Provider, children consume with useContext. This is stable and works regardless of component structure. (2) **Render props** - pass a function as children that receives the values: `<DataProvider>{(data) => <Child data={data}/>}</DataProvider>`. (3) **Custom hooks** - if the components are in the same module, a shared hook can access module-level state. I'd avoid cloneElement because it breaks when children are wrapped in fragments, HOCs, or conditional logic."

**Q4: "Explain the difference between React.Children.map and array.map for children"**

> **Answer**: "React.Children.map handles edge cases that array.map cannot: (1) It works when children is a single element (not an array), (2) It flattens nested arrays and fragments, (3) It properly handles null/undefined, (4) It preserves React's internal key structure when mapping. If you use array.map on props.children directly, you'll crash when there's only one child because a single ReactElement isn't iterable. React.Children.map normalizes these cases."

**Q5: "How do compound components handle accessibility?"**

> **Answer**: "Compound components excel at accessibility because the parent component has full visibility into its children's structure. The parent can: (1) Generate unique IDs that link tabs to panels via aria-controls/aria-labelledby, (2) Manage focus behavior across sub-components, (3) Coordinate keyboard navigation (arrow keys in tabs), (4) Ensure proper roles are applied (tablist, tab, tabpanel). Context lets sub-components query the parent for accessibility attributes they need, keeping the ARIA logic centralized rather than duplicated."

### Code Review Question

```jsx
// 🔍 BUGGY CODE - Find the issues!

function Select({ children, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="select">
      <button onClick={() => setIsOpen(!isOpen)}>
        {value || 'Select...'}
      </button>
      
      {isOpen && (
        <ul>
          {children.map((child, i) => (
            <li key={i} onClick={() => {
              onChange(child.props.value);
              setIsOpen(false);
            }}>
              {child}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Usage
<Select value={selected} onChange={setSelected}>
  <Option value="a">Choice A</Option>
  <Option value="b">Choice B</Option>
</Select>
```

**Issues:**
1. `children.map` crashes with single child (use `React.Children.map`)
2. `key={i}` - index keys cause bugs if options reorder
3. `child.props.value` - assumes child structure, breaks with wrappers
4. Missing accessibility (roles, aria-expanded, keyboard nav)
5. No handling of null children

**Fixed Version:**
```jsx
const SelectContext = createContext(null);

function Select({ children, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  
  const contextValue = useMemo(() => ({
    selectedValue: value,
    onSelect: (val) => {
      onChange(val);
      setIsOpen(false);
    }
  }), [value, onChange]);
  
  return (
    <SelectContext.Provider value={contextValue}>
      <div className="select">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          id={`${id}-button`}
        >
          {value || 'Select...'}
        </button>
        
        {isOpen && (
          <ul role="listbox" aria-labelledby={`${id}-button`}>
            {children}
          </ul>
        )}
      </div>
    </SelectContext.Provider>
  );
}

function Option({ value, children }) {
  const { selectedValue, onSelect } = useContext(SelectContext);
  
  return (
    <li 
      role="option"
      aria-selected={selectedValue === value}
      onClick={() => onSelect(value)}
    >
      {children}
    </li>
  );
}
```

---

## 8. 🔗 CONNECTIONS & TRADE-OFFS (5 min read)

### Relationship Map

```
┌─────────────────────────────────────────────────────────────────┐
│                  COMPOSITION PATTERN HIERARCHY                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     SIMPLE ◄────────────────────────────────────────► COMPLEX   │
│                                                                  │
│   children     Slots        Render Props    Compound Components │
│      │           │               │                  │            │
│   Basic      Multiple        Logic +            State +         │
│   Nesting    Regions         Behavior          Behavior         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### When to Use Each Pattern

| Use Case | Pattern | Why |
|----------|---------|-----|
| Simple wrapper/container | `children` | Minimal API surface |
| Card with header/footer | Named slots | Clear separation of regions |
| List with custom items | Render props | Logic belongs to parent, rendering to consumer |
| Tabs, Accordion, Menu | Compound | Complex state sharing, flexible structure |
| Data fetching + display | Render props + children | Separation of concerns |

### Trade-off Table

| Aspect | children | Slots | Compound Components |
|--------|----------|-------|---------------------|
| **API Simplicity** | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| **Flexibility** | ★★☆☆☆ | ★★★☆☆ | ★★★★★ |
| **State Sharing** | ★☆☆☆☆ | ★☆☆☆☆ | ★★★★★ |
| **Boilerplate** | ★★★★★ | ★★★★☆ | ★★☆☆☆ |
| **TypeScript DX** | ★★★★☆ | ★★★★★ | ★★★☆☆ |
| **Testing Ease** | ★★★★★ | ★★★★★ | ★★★☆☆ |

### Alternatives Comparison

| Pattern | Pros | Cons |
|---------|------|------|
| **HOCs** | Reusable logic wrapping | Wrapper hell, props collision, harder to type |
| **Render Props** | Explicit data flow | Callback hell, verbose JSX |
| **Hooks** | No wrapper components, composable | Can't add elements, logic only |
| **Compound** | Clean API, flexible structure | Context boilerplate, runtime errors possible |

---

## 9. 🛠️ HANDS-ON EXERCISES

### Exercise 1: Easy (10 min) - Flexible List

**Task**: Create a `<List>` component that renders items using children.

```jsx
// Expected Usage:
<List className="my-list" spacing="lg">
  <ListItem>Item 1</ListItem>
  <ListItem>Item 2</ListItem>
  <ListItem highlight>Item 3</ListItem>
</List>

// Requirements:
// 1. List applies className and spacing to wrapper
// 2. ListItem renders content in <li>
// 3. ListItem highlight prop adds "highlighted" class
```

<details>
<summary>Solution</summary>

```jsx
function List({ children, className = '', spacing = 'md' }) {
  return (
    <ul className={`list list-spacing-${spacing} ${className}`}>
      {children}
    </ul>
  );
}

function ListItem({ children, highlight = false }) {
  return (
    <li className={`list-item ${highlight ? 'highlighted' : ''}`}>
      {children}
    </li>
  );
}
```
</details>

---

### Exercise 2: Medium (15 min) - Multi-Slot Card

**Task**: Create a `<Card>` with header, body, and action slots.

```jsx
// Expected Usage:
<Card variant="elevated">
  <Card.Header>
    <h3>Card Title</h3>
  </Card.Header>
  <Card.Body>
    <p>Card content goes here...</p>
  </Card.Body>
  <Card.Actions>
    <button>Cancel</button>
    <button>Save</button>
  </Card.Actions>
</Card>

// Requirements:
// 1. Use compound component pattern
// 2. Card.Header, Card.Body, Card.Actions are optional
// 3. variant prop changes styling ("flat", "elevated", "outlined")
// 4. Proper semantic HTML structure
```

<details>
<summary>Solution</summary>

```jsx
const CardContext = createContext(null);

function Card({ children, variant = 'flat' }) {
  return (
    <CardContext.Provider value={{ variant }}>
      <article className={`card card-${variant}`}>
        {children}
      </article>
    </CardContext.Provider>
  );
}

function CardHeader({ children }) {
  return <header className="card-header">{children}</header>;
}

function CardBody({ children }) {
  return <div className="card-body">{children}</div>;
}

function CardActions({ children }) {
  return <footer className="card-actions">{children}</footer>;
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Actions = CardActions;
```
</details>

---

### Exercise 3: Hard (15 min) - Accessible Accordion

**Task**: Build a fully accessible `<Accordion>` compound component.

```jsx
// Expected Usage:
<Accordion allowMultiple={false}>
  <Accordion.Item id="faq-1">
    <Accordion.Header>Question 1?</Accordion.Header>
    <Accordion.Panel>Answer 1...</Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item id="faq-2">
    <Accordion.Header>Question 2?</Accordion.Header>
    <Accordion.Panel>Answer 2...</Accordion.Panel>
  </Accordion.Item>
</Accordion>

// Requirements:
// 1. allowMultiple: false = only one item open; true = multiple open
// 2. Proper ARIA: aria-expanded, aria-controls, id linking
// 3. Keyboard: Enter/Space toggles, focus management
// 4. Animation-ready: Panel has data-state="open|closed"
// 5. Context error boundaries
```

<details>
<summary>Solution</summary>

```jsx
import { createContext, useContext, useState, useId, useMemo, useCallback } from 'react';

const AccordionContext = createContext(null);
const ItemContext = createContext(null);

function useAccordionContext() {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error('Accordion components must be within <Accordion>');
  return ctx;
}

function useItemContext() {
  const ctx = useContext(ItemContext);
  if (!ctx) throw new Error('Item components must be within <Accordion.Item>');
  return ctx;
}

function Accordion({ children, allowMultiple = false }) {
  const [openIds, setOpenIds] = useState(new Set());
  
  const toggle = useCallback((id) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }, [allowMultiple]);
  
  const isOpen = useCallback((id) => openIds.has(id), [openIds]);
  
  const value = useMemo(() => ({ toggle, isOpen }), [toggle, isOpen]);
  
  return (
    <AccordionContext.Provider value={value}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({ children, id }) {
  const baseId = useId();
  const itemId = id || baseId;
  
  const value = useMemo(() => ({
    itemId,
    headerId: `${itemId}-header`,
    panelId: `${itemId}-panel`
  }), [itemId]);
  
  return (
    <ItemContext.Provider value={value}>
      <div className="accordion-item">{children}</div>
    </ItemContext.Provider>
  );
}

function AccordionHeader({ children }) {
  const { toggle, isOpen } = useAccordionContext();
  const { itemId, headerId, panelId } = useItemContext();
  const open = isOpen(itemId);
  
  return (
    <h3>
      <button
        id={headerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => toggle(itemId)}
        className="accordion-header"
      >
        {children}
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
    </h3>
  );
}

function AccordionPanel({ children }) {
  const { isOpen } = useAccordionContext();
  const { itemId, headerId, panelId } = useItemContext();
  const open = isOpen(itemId);
  
  return (
    <div
      id={panelId}
      role="region"
      aria-labelledby={headerId}
      data-state={open ? 'open' : 'closed'}
      hidden={!open}
      className="accordion-panel"
    >
      {children}
    </div>
  );
}

Accordion.Item = AccordionItem;
Accordion.Header = AccordionHeader;
Accordion.Panel = AccordionPanel;
```
</details>

---

## 10. 🏗️ MINI PROJECT (45-60 min)

### Project: **Multi-Step Form Wizard**

Build a `<Wizard>` compound component for multi-step forms.

#### Requirements

```jsx
// Final Usage:
<Wizard onComplete={(data) => console.log(data)}>
  <Wizard.Steps>
    <Wizard.Step name="personal">
      <PersonalInfoForm />
    </Wizard.Step>
    <Wizard.Step name="address">
      <AddressForm />
    </Wizard.Step>
    <Wizard.Step name="review">
      <ReviewStep />
    </Wizard.Step>
  </Wizard.Steps>
  
  <Wizard.Progress />
  
  <Wizard.Navigation>
    <Wizard.PrevButton>Back</Wizard.PrevButton>
    <Wizard.NextButton>Continue</Wizard.NextButton>
    <Wizard.SubmitButton>Submit</Wizard.SubmitButton>
  </Wizard.Navigation>
</Wizard>
```

#### Acceptance Criteria

1. **State Management**
   - [ ] Track current step index
   - [ ] Collect form data across steps
   - [ ] Handle step validation before advancing

2. **Navigation**
   - [ ] PrevButton goes back (hidden on first step)
   - [ ] NextButton advances (hidden on last step)
   - [ ] SubmitButton only on last step
   - [ ] Support keyboard navigation

3. **Progress Indicator**
   - [ ] Show step names/numbers
   - [ ] Indicate current, completed, upcoming steps
   - [ ] Clickable to jump (if step is completed)

4. **Accessibility**
   - [ ] Proper focus management on step change
   - [ ] ARIA live region for step changes
   - [ ] Keyboard accessible

5. **Flexibility**
   - [ ] Steps can be any content
   - [ ] Custom button labels via children
   - [ ] Optional validation prop on Step

#### What Interviewers Look For

- Clean separation between Wizard logic and step content
- Proper TypeScript types for the API
- Handling of edge cases (single step, disabled navigation)
- Context value memoization
- Error boundaries for compound components

---

## 11. 📊 PERFORMANCE CONSIDERATIONS

### Render Optimization

```jsx
// ❌ BAD: Context value recreated every render
function Tabs({ children }) {
  const [active, setActive] = useState(0);
  return (
    <TabsContext.Provider value={{ active, setActive }}> {/* New obj! */}
      {children}
    </TabsContext.Provider>
  );
}

// ✅ GOOD: Memoized context value
function Tabs({ children }) {
  const [active, setActive] = useState(0);
  const value = useMemo(() => ({ active, setActive }), [active]);
  return (
    <TabsContext.Provider value={value}>
      {children}
    </TabsContext.Provider>
  );
}
```

### Context Splitting for Large Trees

```jsx
// Split contexts to minimize re-renders
const TabsStateContext = createContext(null);  // { activeIndex }
const TabsDispatchContext = createContext(null);  // { setActiveIndex }

function Tabs({ children }) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  return (
    <TabsDispatchContext.Provider value={setActiveIndex}>
      <TabsStateContext.Provider value={activeIndex}>
        {children}
      </TabsStateContext.Provider>
    </TabsDispatchContext.Provider>
  );
}

// Components that only dispatch don't re-render on state change
function Tab({ index }) {
  const setActive = useContext(TabsDispatchContext);  // Stable reference
  return <button onClick={() => setActive(index)}>...</button>;
}
```

### Measuring Impact

```jsx
// React DevTools Profiler
// 1. Record interaction
// 2. Look for "Context Provider" causing cascading re-renders
// 3. Check if children re-render when only context changes

// Add to debug:
function TabPanel({ index, children }) {
  console.count('TabPanel render');  // Should not increment for inactive panels
}
```

---

## 12. ✅ SELF-ASSESSMENT CHECKLIST

Before moving on, I should be able to:

- [ ] **Explain** what `children` prop is and how JSX transforms it
- [ ] **Explain** the difference between children, slots, and compound components
- [ ] **Implement** a simple component using children from memory
- [ ] **Implement** a compound component with Context from memory
- [ ] **Debug** "Cannot read property of undefined" in compound components
- [ ] **Decide** when to use compound components vs. render props
- [ ] **Identify** performance issues with Context value creation
- [ ] **Write** proper TypeScript types for children prop variations
- [ ] **Add** accessibility attributes to compound tab/accordion components
- [ ] **Explain** why cloneElement is discouraged and alternatives

---

## 13. 🎤 INTERVIEW SCRIPT

### 30-Second Version (Elevator Pitch)

> "Component composition is React's way of building flexible UIs without inheritance. The `children` prop lets components receive content between their tags, acting like a slot. For complex stateful UIs like tabs or accordions, we use compound components - a pattern where parent and children share state via Context. This gives consumers a clean declarative API like `<Tabs.Tab>` while keeping state management internal. The key insight is that `children` is just a prop - JSX `<Parent><Child/></Parent>` becomes `Parent({ children: <Child/> })`."

### 2-Minute Version (Detailed)

> "Component composition in React follows three patterns of increasing complexity:
>
> **First, the children prop** - the simplest form. Whatever you put between component tags becomes the children prop. This is how we build wrapper components like Cards, Modals, or Layouts where the container is reusable but the content changes.
>
> **Second, named slots** - using multiple props for different content regions. A Modal might have `header`, `footer`, and `children` for the body. This gives clear structure while maintaining flexibility.
>
> **Third, compound components** - for stateful, multi-part UIs. Think of Tabs: the TabList needs to know which Tab is active, and TabPanels need to show the right content. Instead of prop drilling, we use Context. The parent Tabs component provides state via Provider, and all sub-components consume it. This gives consumers a beautiful API - they just write `<Tabs.Tab>` without worrying about wiring.
>
> The key implementation details: always use `React.Children.map` instead of direct array methods because children can be a single element or array. Memoize Context values to prevent cascading re-renders. Include error boundaries so compound components fail fast when used outside their parent. And prefer Context over cloneElement because cloneElement breaks when children are wrapped."

### 5-Minute Version (Deep Dive with Examples)

> "Let me walk through component composition comprehensively:
>
> **The Foundation: Children as Prop**
> When you write `<Modal><Content/></Modal>`, JSX transforms this to `Modal({ children: <Content/> })`. The children prop can be undefined, a single element, an array, a string, or even a function for render props. This abstraction is how React achieves component reusability without class inheritance.
>
> **Pattern 1: Simple Container**
> ```jsx
> function Card({ children }) {
>   return <div className="card">{children}</div>;
> }
> ```
> The Card doesn't know or care what's inside - it just provides structure and styling.
>
> **Pattern 2: Multi-Slot Layout**
> ```jsx
> function Modal({ header, footer, children }) {
>   return (
>     <div className="modal">
>       <header>{header}</header>
>       <main>{children}</main>
>       <footer>{footer}</footer>
>     </div>
>   );
> }
> ```
> Named props act as named slots, giving clear regions for content without nesting complexity.
>
> **Pattern 3: Compound Components**
> This is where it gets powerful. For a Tabs component:
> ```jsx
> function Tabs({ children }) {
>   const [activeIndex, setActiveIndex] = useState(0);
>   const value = useMemo(() => ({ activeIndex, setActiveIndex }), [activeIndex]);
>   return (
>     <TabsContext.Provider value={value}>
>       {children}
>     </TabsContext.Provider>
>   );
> }
> 
> Tabs.Tab = function Tab({ index, children }) {
>   const { activeIndex, setActiveIndex } = useContext(TabsContext);
>   return (
>     <button 
>       aria-selected={index === activeIndex}
>       onClick={() => setActiveIndex(index)}
>     >
>       {children}
>     </button>
>   );
> };
> ```
>
> The consumer writes clean JSX like `<Tabs><Tabs.Tab>...</Tabs.Tab></Tabs>` while state management is encapsulated.
>
> **Critical Implementation Details:**
>
> 1. **React.Children utilities** - Always use `React.Children.map` over `children.map` because a single child isn't an array.
>
> 2. **Context safety** - Every compound component needs a guard:
>    ```jsx
>    const ctx = useContext(TabsContext);
>    if (!ctx) throw new Error('Tab must be inside Tabs');
>    ```
>
> 3. **Performance** - Memoize context values. If you pass `{{ active, setActive }}` inline, every render creates a new object, triggering all consumers to re-render.
>
> 4. **Avoid cloneElement** - It's fragile. If someone wraps your children in a Fragment or div, cloneElement fails silently. Context is more robust.
>
> 5. **Accessibility** - Compound components excel here because the parent has visibility into the entire structure. It can generate matching IDs for aria-controls/aria-labelledby across tabs and panels.
>
> **Trade-off Decision Framework:**
> - Simple nesting → children prop
> - Multiple content regions → named slots
> - State sharing across parts → compound components
> - Logic + rendering separation → render props
> - Just logic sharing → custom hooks
>
> The beauty of React's composition model is that these patterns compose together. A compound component can accept render props, which can use hooks internally. The key is choosing the right abstraction level for your use case."
