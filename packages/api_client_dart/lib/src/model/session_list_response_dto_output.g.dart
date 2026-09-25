// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'session_list_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SessionListResponseDtoOutput extends SessionListResponseDtoOutput {
  @override
  final BuiltList<SessionListResponseDtoOutputItemsInner> items;
  @override
  final String? nextCursor;

  factory _$SessionListResponseDtoOutput(
          [void Function(SessionListResponseDtoOutputBuilder)? updates]) =>
      (SessionListResponseDtoOutputBuilder()..update(updates))._build();

  _$SessionListResponseDtoOutput._({required this.items, this.nextCursor})
      : super._();
  @override
  SessionListResponseDtoOutput rebuild(
          void Function(SessionListResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SessionListResponseDtoOutputBuilder toBuilder() =>
      SessionListResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SessionListResponseDtoOutput &&
        items == other.items &&
        nextCursor == other.nextCursor;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, nextCursor.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SessionListResponseDtoOutput')
          ..add('items', items)
          ..add('nextCursor', nextCursor))
        .toString();
  }
}

class SessionListResponseDtoOutputBuilder
    implements
        Builder<SessionListResponseDtoOutput,
            SessionListResponseDtoOutputBuilder> {
  _$SessionListResponseDtoOutput? _$v;

  ListBuilder<SessionListResponseDtoOutputItemsInner>? _items;
  ListBuilder<SessionListResponseDtoOutputItemsInner> get items =>
      _$this._items ??= ListBuilder<SessionListResponseDtoOutputItemsInner>();
  set items(ListBuilder<SessionListResponseDtoOutputItemsInner>? items) =>
      _$this._items = items;

  String? _nextCursor;
  String? get nextCursor => _$this._nextCursor;
  set nextCursor(String? nextCursor) => _$this._nextCursor = nextCursor;

  SessionListResponseDtoOutputBuilder() {
    SessionListResponseDtoOutput._defaults(this);
  }

  SessionListResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _nextCursor = $v.nextCursor;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SessionListResponseDtoOutput other) {
    _$v = other as _$SessionListResponseDtoOutput;
  }

  @override
  void update(void Function(SessionListResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SessionListResponseDtoOutput build() => _build();

  _$SessionListResponseDtoOutput _build() {
    _$SessionListResponseDtoOutput _$result;
    try {
      _$result = _$v ??
          _$SessionListResponseDtoOutput._(
            items: items.build(),
            nextCursor: nextCursor,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'SessionListResponseDtoOutput', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
