// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'route_list_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RouteListResponseDtoOutput extends RouteListResponseDtoOutput {
  @override
  final BuiltList<RouteListResponseDtoOutputItemsInner> items;
  @override
  final String? nextCursor;

  factory _$RouteListResponseDtoOutput(
          [void Function(RouteListResponseDtoOutputBuilder)? updates]) =>
      (RouteListResponseDtoOutputBuilder()..update(updates))._build();

  _$RouteListResponseDtoOutput._({required this.items, this.nextCursor})
      : super._();
  @override
  RouteListResponseDtoOutput rebuild(
          void Function(RouteListResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RouteListResponseDtoOutputBuilder toBuilder() =>
      RouteListResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RouteListResponseDtoOutput &&
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
    return (newBuiltValueToStringHelper(r'RouteListResponseDtoOutput')
          ..add('items', items)
          ..add('nextCursor', nextCursor))
        .toString();
  }
}

class RouteListResponseDtoOutputBuilder
    implements
        Builder<RouteListResponseDtoOutput, RouteListResponseDtoOutputBuilder> {
  _$RouteListResponseDtoOutput? _$v;

  ListBuilder<RouteListResponseDtoOutputItemsInner>? _items;
  ListBuilder<RouteListResponseDtoOutputItemsInner> get items =>
      _$this._items ??= ListBuilder<RouteListResponseDtoOutputItemsInner>();
  set items(ListBuilder<RouteListResponseDtoOutputItemsInner>? items) =>
      _$this._items = items;

  String? _nextCursor;
  String? get nextCursor => _$this._nextCursor;
  set nextCursor(String? nextCursor) => _$this._nextCursor = nextCursor;

  RouteListResponseDtoOutputBuilder() {
    RouteListResponseDtoOutput._defaults(this);
  }

  RouteListResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _nextCursor = $v.nextCursor;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RouteListResponseDtoOutput other) {
    _$v = other as _$RouteListResponseDtoOutput;
  }

  @override
  void update(void Function(RouteListResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RouteListResponseDtoOutput build() => _build();

  _$RouteListResponseDtoOutput _build() {
    _$RouteListResponseDtoOutput _$result;
    try {
      _$result = _$v ??
          _$RouteListResponseDtoOutput._(
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
            r'RouteListResponseDtoOutput', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
