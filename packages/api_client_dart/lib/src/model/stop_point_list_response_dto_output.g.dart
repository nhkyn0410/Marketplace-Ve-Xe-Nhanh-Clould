// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'stop_point_list_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$StopPointListResponseDtoOutput extends StopPointListResponseDtoOutput {
  @override
  final BuiltList<StopPointListResponseDtoOutputItemsInner> items;
  @override
  final String? nextCursor;

  factory _$StopPointListResponseDtoOutput(
          [void Function(StopPointListResponseDtoOutputBuilder)? updates]) =>
      (StopPointListResponseDtoOutputBuilder()..update(updates))._build();

  _$StopPointListResponseDtoOutput._({required this.items, this.nextCursor})
      : super._();
  @override
  StopPointListResponseDtoOutput rebuild(
          void Function(StopPointListResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  StopPointListResponseDtoOutputBuilder toBuilder() =>
      StopPointListResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is StopPointListResponseDtoOutput &&
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
    return (newBuiltValueToStringHelper(r'StopPointListResponseDtoOutput')
          ..add('items', items)
          ..add('nextCursor', nextCursor))
        .toString();
  }
}

class StopPointListResponseDtoOutputBuilder
    implements
        Builder<StopPointListResponseDtoOutput,
            StopPointListResponseDtoOutputBuilder> {
  _$StopPointListResponseDtoOutput? _$v;

  ListBuilder<StopPointListResponseDtoOutputItemsInner>? _items;
  ListBuilder<StopPointListResponseDtoOutputItemsInner> get items =>
      _$this._items ??= ListBuilder<StopPointListResponseDtoOutputItemsInner>();
  set items(ListBuilder<StopPointListResponseDtoOutputItemsInner>? items) =>
      _$this._items = items;

  String? _nextCursor;
  String? get nextCursor => _$this._nextCursor;
  set nextCursor(String? nextCursor) => _$this._nextCursor = nextCursor;

  StopPointListResponseDtoOutputBuilder() {
    StopPointListResponseDtoOutput._defaults(this);
  }

  StopPointListResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _nextCursor = $v.nextCursor;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(StopPointListResponseDtoOutput other) {
    _$v = other as _$StopPointListResponseDtoOutput;
  }

  @override
  void update(void Function(StopPointListResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  StopPointListResponseDtoOutput build() => _build();

  _$StopPointListResponseDtoOutput _build() {
    _$StopPointListResponseDtoOutput _$result;
    try {
      _$result = _$v ??
          _$StopPointListResponseDtoOutput._(
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
            r'StopPointListResponseDtoOutput', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
