// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'route_input_dto_stops_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RouteInputDtoStopsInner extends RouteInputDtoStopsInner {
  @override
  final String? catalogStopPointId;
  @override
  final String? stopPointId;
  @override
  final String? note;

  factory _$RouteInputDtoStopsInner(
          [void Function(RouteInputDtoStopsInnerBuilder)? updates]) =>
      (RouteInputDtoStopsInnerBuilder()..update(updates))._build();

  _$RouteInputDtoStopsInner._(
      {this.catalogStopPointId, this.stopPointId, this.note})
      : super._();
  @override
  RouteInputDtoStopsInner rebuild(
          void Function(RouteInputDtoStopsInnerBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RouteInputDtoStopsInnerBuilder toBuilder() =>
      RouteInputDtoStopsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RouteInputDtoStopsInner &&
        catalogStopPointId == other.catalogStopPointId &&
        stopPointId == other.stopPointId &&
        note == other.note;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, catalogStopPointId.hashCode);
    _$hash = $jc(_$hash, stopPointId.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RouteInputDtoStopsInner')
          ..add('catalogStopPointId', catalogStopPointId)
          ..add('stopPointId', stopPointId)
          ..add('note', note))
        .toString();
  }
}

class RouteInputDtoStopsInnerBuilder
    implements
        Builder<RouteInputDtoStopsInner, RouteInputDtoStopsInnerBuilder> {
  _$RouteInputDtoStopsInner? _$v;

  String? _catalogStopPointId;
  String? get catalogStopPointId => _$this._catalogStopPointId;
  set catalogStopPointId(String? catalogStopPointId) =>
      _$this._catalogStopPointId = catalogStopPointId;

  String? _stopPointId;
  String? get stopPointId => _$this._stopPointId;
  set stopPointId(String? stopPointId) => _$this._stopPointId = stopPointId;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  RouteInputDtoStopsInnerBuilder() {
    RouteInputDtoStopsInner._defaults(this);
  }

  RouteInputDtoStopsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _catalogStopPointId = $v.catalogStopPointId;
      _stopPointId = $v.stopPointId;
      _note = $v.note;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RouteInputDtoStopsInner other) {
    _$v = other as _$RouteInputDtoStopsInner;
  }

  @override
  void update(void Function(RouteInputDtoStopsInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RouteInputDtoStopsInner build() => _build();

  _$RouteInputDtoStopsInner _build() {
    final _$result = _$v ??
        _$RouteInputDtoStopsInner._(
          catalogStopPointId: catalogStopPointId,
          stopPointId: stopPointId,
          note: note,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
